const {MongoClient} = require('mongodb');


describe('TEST: ADMIN POLICY', () => {
  let connection;
  let db;


  const SwaggyBot = {
    '_id' : 'AAA',
    'activeMode' : false,
    'activeAll' : false,
    'activePolicy' : 1,
    'departmentsActive' : ['Graduate Office'],
    'jid' : 'bot-jid',
    'currentRequests' : 3103
  }

  async function retrieveBotPolicy(){
      let policy = await db.collection(('AdminPolicy')).findOne();
      // console.log(policy);
      return policy;
  }

  async function getAndSetTicketNumber() {

      let result = await db.collection('AdminPolicy').findOneAndUpdate(
          {'_id': 'AAA'},
          {
              $inc: {'currentRequests': 1}
          });

      return result.value.currentRequests;
  }

  beforeAll(async () => {

    connection = await MongoClient.connect(global.__MONGO_URI__, {
                                            useNewUrlParser: true,
                                            useUnifiedTopology: true
                                            });
            db = await connection.db(global.__MONGO_DB_NAME__);
            await db.collection('Agent').deleteMany({});
            await db.collection('Department').deleteMany({});
            await db.collection('AdminPolicy').deleteMany({});
            const AdminPolicy = db.collection('AdminPolicy');
            await db.collection('PendingRequests').deleteMany({});
            await AdminPolicy.insertOne(SwaggyBot);
            });

  afterAll(async () => {
           await connection.close();
           // await db.close();


           });


 it('ADMIN POLICY | retrieveBotPolicy()', async() => {
   let botjid = await retrieveBotPolicy();
   expect(botjid.jid).toStrictEqual(SwaggyBot.jid);
 })

 it('ADMIN POLICY | getAndSetTicketNumber()', async() => {
   let bot = await getAndSetTicketNumber();
   expect(bot).toStrictEqual(SwaggyBot.currentRequests);
 })

})
