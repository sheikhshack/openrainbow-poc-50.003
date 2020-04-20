const {MongoClient} = require('mongodb');

describe('TEST : FAILED REQUETS', () => {
  let connection;
  let db;

  const failedRequest1 = {
    '_id' : 'AAAA',
    'TicketNumber': 1,
    'Department' : "Graduate Office",
    'ClientEmail': "swaagyy@swaggys.com",
    'TypeOfCommunication' : "Chat",
    'Problem' :  "I am a problem",
     'AttendedTo': false,
    // 'TimeOfLog' : new Date()
  }

  async function logFailedRequest(department, clientEmail, communication, problem, ticketNumber) {
    await db.collection('FailedRequests').insertOne(
     {
       '_id' : 'AAAA',
       'TicketNumber': ticketNumber,
       'Department' : department,
       'ClientEmail': clientEmail,
       'TypeOfCommunication' : communication,
       'Problem' :  problem,
        'AttendedTo': false,
       // 'TimeOfLog' : new Date()
     })
  }

  beforeAll(async () => {

            connection = await MongoClient.connect(process.env.MONGO_URL, {
                                                   useNewUrlParser: true,
                                                   useUnifiedTopology: true
                                                   });
             db = await connection.db(global.__MONGO_DB_NAME__);

            // db = await connection.db();
            await db.collection('Agent').deleteMany({});
            await db.collection('Department').deleteMany({});
            await db.collection('AdminPolicy').deleteMany({});
            await db.collection('PendingRequests').deleteMany({});
            });

  afterAll(async () => {
           await connection.close();
           // await db.close();

           });

  it('FAILED REQUESTS | logFailedRequest()', async() => {
    const FailedRequest = db.collection('FailedRequests');
    await logFailedRequest(failedRequest1.Department, failedRequest1.ClientEmail, failedRequest1.TypeOfCommunication, failedRequest1.Problem, failedRequest1.TicketNumber)
    let result = await FailedRequest.findOne()
    expect(result).toStrictEqual(failedRequest1);
  })


})
