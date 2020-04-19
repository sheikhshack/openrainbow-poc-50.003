const {MongoClient} = require('mongodb');

// Test Queues Collection
describe('TEST: Pending Collection', () => {
  let connection;
  let db;

  async function getCurrentQ(department, queueType)
  {
    if (queueType === "Main Queue") {
      let JSONObj = await db.collection('Queues').findOne(
        {"Department" : department},
        {$projection: {"Queue" : 1}})
      return JSONObj.Queue;
    }
    else if (queueType === "ChatQ") {
      let JSONObj = await db.collection('Queues').findOne(
        {"Department" : department},
        {$projection: {"ChatQ" : 1}})
      return JSONObj.ChatQ;
    }
    else if (queueType === "OtherQ") {
      let JSONObj = await db.collection('Queues').findOne(
        {"Department" : department},
        {$projection: {"OtherQ" : 1}})
      return JSONObj.OtherQ;
    }
    else if (queueType === "DropQEventHandler") {
      let JSONObj = await db.collection('Queues').findOne(
        {"Department" : department},
        {$projection: {"DropQEventHandler" : 1}})

      console.log("this is the Jasjkfgaisduyfgasduf ", JSONObj)
      return JSONObj.DropQEventHandler;
    }
  }

  async function addToWaitQ(name, department, communication, problem, queueNumber, queueDropped)
  {
    let thisRequest = {
        "Department": department,
        "Client": name,
        "Communication": communication,
        "Problem": problem,
        "Qno": queueNumber,
        "queueDropped" : queueDropped
      }

    let JSONObj =  await db.collection('Queues').findOne(
      {"Department" : department},
      {projection: {'Queue' : 1}})
    let currentQ = JSONObj.Queue;
    currentQ.push(thisRequest);
    await db.collection('Queues').findOneAndUpdate(
      {"Department" : department},
      {$set: {"Queue" : currentQ}})
  }

  async function splitWaitQ(department)
  {
    let currentQ = await getCurrentQ(department, "Main Queue");
    let ChatQ = []
    let OtherQ = []
    for (var i = 0;  i < currentQ.length; i++) {
      if (currentQ[i].Communication == "Chat") {
        ChatQ.push(currentQ[i])
      }
      else if (currentQ[i].Communication == "Audio" ||  currentQ[i].Communication == "Video") {
        OtherQ.push(currentQ[i])
      }
    }

    await db.collection('Queues').findOneAndUpdate(
      {"Department" : department},
      {$set : {"ChatQ" : ChatQ, "OtherQ" : OtherQ}})
  }

  async function updateWaitQ(department, index)
  {
    let currentQ = await getCurrentQ(department, "Main Queue");

    currentQ.splice(index,1);

    await db.collection('Queues').findOneAndUpdate(
      {"Department" : department},
      {$set: {"Queue" : currentQ}})
  }



  beforeEach(async () => {
            connection = await MongoClient.connect(process.env.MONGO_URL, {
                                                   useNewUrlParser: true,
                                                   useUnifiedTopology: true
                                                   });
            db = await connection.db();
            await db.collection('PendingRequests').deleteMany({});
            await db.collection('Agent').deleteMany({});
            await db.collection('Department').deleteMany({});
            await db.collection('Queues').deleteMany({});

            await db.collection('Queues').insertOne({
              "Department" : "Graduate Office",
              "Queue" : [],
              "ChatQ" : [],
              "OtherQ" : [],
              "ChatQServed" :  0,
              "DropQEventHandler" : []
              })
            });

  afterEach(async () => {
           await connection.close();
           });

  const mockClient_One = {
    "Client" : "Tin Kit",
    "Department" : "Graduate Office",
    "Communication" : "Chat",
    "Problem" : "This is a problem",
    "Qno" : 2,
    "queueDropped" : false
  }

  const mockClient_Two = {
    "Client" : "Wing Kit",
    "Department" : "Graduate Office",
    "Communication" : "Audio",
    "Problem" : "This is a problem",
    "Qno" : 3,
    "queueDropped" : false
  }

  const mockClient_Three = {
    "Client" : "Tonkie Kit",
    "Department" : "Graduate Office",
    "Communication" : "Video",
    "Problem" : "This is a problem",
    "Qno" : 4,
    "queueDropped" : false
  }


   it('QUEUES COLLECTION | splitWaitQ and getCurrentQ for chatQ, MainQ, OtherQ ', async() => {
       const QueuesCollection = db.collection('Queues');
       await addToWaitQ(mockClient_One.Client, mockClient_One.Department, mockClient_One.Communication, mockClient_One.Problem, mockClient_One.Qno, mockClient_One.queueDropped);
       await addToWaitQ(mockClient_Two.Client, mockClient_Two.Department, mockClient_Two.Communication, mockClient_Two.Problem, mockClient_Two.Qno, mockClient_Two.queueDropped);
       await addToWaitQ(mockClient_Three.Client, mockClient_Three.Department, mockClient_Three.Communication, mockClient_Three.Problem, mockClient_Three.Qno, mockClient_Three.queueDropped);
       await splitWaitQ("Graduate Office");
       let MainQ = await getCurrentQ("Graduate Office", "Main Queue");
       let ChatQ = await getCurrentQ("Graduate Office", "ChatQ");
       let OtherQ = await getCurrentQ("Graduate Office", "OtherQ");

       // console.log("This is the main Q ", MainQ);
       expect(MainQ[0]).toStrictEqual(mockClient_One);
       expect(MainQ[1]).toStrictEqual(mockClient_Two);
       expect(MainQ[2]).toStrictEqual(mockClient_Three);
       expect(ChatQ[0]).toStrictEqual(mockClient_One);
       expect(OtherQ[0]).toStrictEqual(mockClient_Two);
       expect(OtherQ[1]).toStrictEqual(mockClient_Three);
    })

    it('QUEUES COLLECTION | updateWaitQ', async() => {
      await addToWaitQ(mockClient_One.Client, mockClient_One.Department, mockClient_One.Communication, mockClient_One.Problem, mockClient_One.Qno, mockClient_One.queueDropped);
      await addToWaitQ(mockClient_Two.Client, mockClient_Two.Department, mockClient_Two.Communication, mockClient_Two.Problem, mockClient_Two.Qno, mockClient_Two.queueDropped);
      await addToWaitQ(mockClient_Three.Client, mockClient_Three.Department, mockClient_Three.Communication, mockClient_Three.Problem, mockClient_Three.Qno, mockClient_Three.queueDropped);
      await updateWaitQ("Graduate Office", 0);
      let MainQ = await getCurrentQ("Graduate Office", "Main Queue");
      expect(MainQ).toStrictEqual([mockClient_Two, mockClient_Three]);
  })
})
