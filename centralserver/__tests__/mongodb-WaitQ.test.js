const {MongoClient} = require('mongodb');

// Test Queues Collection
describe('TEST: QUEUES COLLECTION', () => {
  let connection;
  let db;

  async function getQueueNumber(department, queueNumber)
  {
    let currentQ = await getCurrentQ(department, "Main Queue");
    let clientQno;
    for (var i = 0; i < currentQ.length; i++) {
      if (queueNumber == currentQ[i].Qno) {
        clientQno = currentQ.indexOf(currentQ[i]);
        // console.log("Inside getQueueNumber Function and this is the Qno ", clientQno);
      }
      else {
        // console.log("Client is not in the wait Queue!");
      }
    }
    return clientQno;
  }

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

  async function updateChatQ(department) {
    let ChatQ = await getCurrentQ(department, "ChatQ")
    ChatQ.splice(0,1);
    await db.collection('Queues').findOneAndUpdate(
      {"Department" : department},
      {$set: {"ChatQ" : ChatQ}})
  }

  async function updateOtherQ(department) {
    let OtherQ = await getCurrentQ(department, "OtherQ")
    OtherQ.splice(0,1);
    await db.collection('Queues').findOneAndUpdate(
      {"Department" : department},
      {$set: {"OtherQ" : OtherQ}})
  }

  async function clientPicker(department)
  {
    let JSONObj = await db.collection('Queues').findOne(
      {"Department" : department},
      {$projection: {"ChatQServed" : 1}})
    let ChatQServed = JSONObj.ChatQServed;
    let OtherQ = await getCurrentQ(department, "OtherQ");
    let ChatQ = await getCurrentQ(department, "ChatQ");
    let selectedClient;

    if (ChatQServed % 3 == 0 && ChatQServed != 0) {
      if (OtherQ.length == 0) {
        selectedClient = ChatQ[0];
        return selectedClient;
      }
      selectedClient = OtherQ[0];
    }

    else {
      if (ChatQ.length == 0) {
        selectedClient = OtherQ[0];
        return selectedClient;
      }
      selectedClient = ChatQ[0];
    }
    return selectedClient;
  }

  async function incChatQServed(department)
  {
    await db.collection('Queues').findOneAndUpdate(
      {"Department" : department},
      {$inc: {"ChatQServed" : 1}})
  }

  async function handleQueueDrop(department, Qno, QueueType)
  {
    let index;
    let currentQ = await getCurrentQ(department, QueueType);
    for (var i = 0; i < currentQ.length; i++) {
      if (currentQ[i].Qno == Qno) {
        index = i;
      }
    }

    if (index != null) {
    currentQ.splice(index,1);
    }

    if (QueueType === "Main Queue") {
      await db.collection('Queues').findOneAndUpdate(
        {'Department' : department},
        {$set: {"Queue" : currentQ }})
    }
    else if (QueueType === "ChatQ") {
      await db.collection('Queues').findOneAndUpdate(
        {'Department' : department},
        {$set: {"ChatQ" : currentQ }})
    }
    else if (QueueType === "OtherQ") {
      await db.collection('Queues').findOneAndUpdate(
        {'Department' : department},
        {$set: {"OtherQ" : currentQ }
      })
    }
  }

  async function addDroppQEvent(department, Qno)
  {
    let DropQClient =
    {
    "Qno" : Qno,
    "DropQHandled" : false
    }
    let DropQEventHandler = await getCurrentQ(department, "DropQEventHandler");
    DropQEventHandler.push(DropQClient)
    await db.collection('Queues').findOneAndUpdate(
      {"Department" :  department},
      {$set: {'DropQEventHandler' : DropQEventHandler}})
  }

  async function updateDropQHandler(department) {
    let currentQ = await getCurrentQ(department, "DropQEventHandler");
    currentQ.splice(0,1);
    await db.collection('Queues').findOneAndUpdate(
      {"Department" : department},
      {$set: {"DropQEventHandler" : currentQ}})
  }

  async function resetQ(department) {
    await db.collection('Queues').updateOne(
      {'Department' : department},
      {$set : { "Queue" : [],
                "ChatQ" : [],
                "OtherQ" : [],
                "ChatQServed" :  0,
                "DropQEventHandler" : [] }}
  );
  }

  beforeAll(async () => {
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

  afterAll(async () => {
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

  const mockClient_Four = {
    "Client" : "jia Kit",
    "Department" : "Graduate Office",
    "Communication" : "Chat",
    "Problem" : "This is a problem",
    "Qno" : 5,
    "queueDropped" : false
  }

  const mockClient_Six = {
    "Client" : "asdasd Kit",
    "Department" : "Graduate Office",
    "Communication" : "Chat",
    "Problem" : "This is a problem",
    "Qno" : 6,
    "queueDropped" : false
  }

  const mockClient_Seven = {
    "Client" : "asfasdfasdfa Kit",
    "Department" : "Graduate Office",
    "Communication" : "Chat",
    "Problem" : "This is a problem",
    "Qno" : 7,
    "queueDropped" : false
  }

  const mockClient_Eight = {
    "Client" : "asdasd Kit",
    "Department" : "Graduate Office",
    "Communication" : "Chat",
    "Problem" : "This is a problem",
    "Qno" : 8,
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

       expect(MainQ[0]).toStrictEqual(mockClient_One);
       expect(MainQ[1]).toStrictEqual(mockClient_Two);
       expect(MainQ[2]).toStrictEqual(mockClient_Three);
       expect(ChatQ[0]).toStrictEqual(mockClient_One);
       expect(OtherQ[0]).toStrictEqual(mockClient_Two);
       expect(OtherQ[1]).toStrictEqual(mockClient_Three);
    })

    it('QUEUES COLLECTION | updateWaitQ', async() => {
      await resetQ("Graduate Office");
      await addToWaitQ(mockClient_One.Client, mockClient_One.Department, mockClient_One.Communication, mockClient_One.Problem, mockClient_One.Qno, mockClient_One.queueDropped);
      await addToWaitQ(mockClient_Two.Client, mockClient_Two.Department, mockClient_Two.Communication, mockClient_Two.Problem, mockClient_Two.Qno, mockClient_Two.queueDropped);
      await addToWaitQ(mockClient_Three.Client, mockClient_Three.Department, mockClient_Three.Communication, mockClient_Three.Problem, mockClient_Three.Qno, mockClient_Three.queueDropped);
      await updateWaitQ("Graduate Office", 0);
      let MainQ = await getCurrentQ("Graduate Office", "Main Queue");
      expect(MainQ).toStrictEqual([mockClient_Two, mockClient_Three]);
  })

    it('QUEUES COLLECTION | updateChatQ(department)', async() => {
      await resetQ("Graduate Office");
      await addToWaitQ(mockClient_One.Client, mockClient_One.Department, mockClient_One.Communication, mockClient_One.Problem, mockClient_One.Qno, mockClient_One.queueDropped);
      await addToWaitQ(mockClient_Two.Client, mockClient_Two.Department, mockClient_Two.Communication, mockClient_Two.Problem, mockClient_Two.Qno, mockClient_Two.queueDropped);
      await addToWaitQ(mockClient_Three.Client, mockClient_Three.Department, mockClient_Three.Communication, mockClient_Three.Problem, mockClient_Three.Qno, mockClient_Three.queueDropped);
      await splitWaitQ("Graduate Office");
      await updateChatQ("Graduate Office");
      let ChatQ = await getCurrentQ("Graduate Office", "ChatQ");
      expect(ChatQ).toStrictEqual([]);
    })

    it('QUEUES COLLECTION | updateOtherQ(department)', async() => {
      await resetQ("Graduate Office");
      await addToWaitQ(mockClient_One.Client, mockClient_One.Department, mockClient_One.Communication, mockClient_One.Problem, mockClient_One.Qno, mockClient_One.queueDropped);
      await addToWaitQ(mockClient_Two.Client, mockClient_Two.Department, mockClient_Two.Communication, mockClient_Two.Problem, mockClient_Two.Qno, mockClient_Two.queueDropped);
      await addToWaitQ(mockClient_Three.Client, mockClient_Three.Department, mockClient_Three.Communication, mockClient_Three.Problem, mockClient_Three.Qno, mockClient_Three.queueDropped);
      await splitWaitQ("Graduate Office");
      await updateOtherQ("Graduate Office");
      let OtherQ = await getCurrentQ("Graduate Office", "OtherQ");
      expect(OtherQ).toStrictEqual([mockClient_Three]);
    })


    it('QUEUES COLLECTION | clientPicker(department)', async() => {
      await resetQ("Graduate Office");
      await addToWaitQ(mockClient_One.Client, mockClient_One.Department, mockClient_One.Communication, mockClient_One.Problem, mockClient_One.Qno, mockClient_One.queueDropped);
      await addToWaitQ(mockClient_Two.Client, mockClient_Two.Department, mockClient_Two.Communication, mockClient_Two.Problem, mockClient_Two.Qno, mockClient_Two.queueDropped);
      await addToWaitQ(mockClient_Three.Client, mockClient_Three.Department, mockClient_Three.Communication, mockClient_Three.Problem, mockClient_Three.Qno, mockClient_Three.queueDropped);
      await addToWaitQ(mockClient_Four.Client, mockClient_Four.Department, mockClient_Four.Communication, mockClient_Four.Problem, mockClient_Four.Qno, mockClient_Four.queueDropped);
      await addToWaitQ(mockClient_Six.Client, mockClient_Six.Department, mockClient_Six.Communication, mockClient_Six.Problem, mockClient_Six.Qno, mockClient_Six.queueDropped);
      await addToWaitQ(mockClient_Seven.Client, mockClient_Seven.Department, mockClient_Seven.Communication, mockClient_Seven.Problem, mockClient_Seven.Qno, mockClient_Seven.queueDropped);
      await addToWaitQ(mockClient_Eight.Client, mockClient_Eight.Department, mockClient_Eight.Communication, mockClient_Eight.Problem, mockClient_Eight.Qno, mockClient_Eight.queueDropped);
      await splitWaitQ("Graduate Office");
      let selectedClient = await clientPicker("Graduate Office")
      expect(selectedClient).toStrictEqual(mockClient_One);
    })

    it('QUEUES COLLECTION | incChatQServed(department)', async() => {
      const QueuesCollection = db.collection('Queues');
      await resetQ("Graduate Office");
      await incChatQServed("Graduate Office");
      let result = await QueuesCollection.findOne(
        {'Department' : "Graduate Office"},
        {$projection : {"ChatQServed" : 1}})
      expect(result.ChatQServed).toBe(1);
    })

    it('QUEUES COLLECTION | handleQueueDrop(department, Qno, QueueType) - ChatQ', async() => {
      const QueuesCollection = db.collection('Queues');
      await resetQ("Graduate Office");
      await addToWaitQ(mockClient_One.Client, mockClient_One.Department, mockClient_One.Communication, mockClient_One.Problem, mockClient_One.Qno, mockClient_One.queueDropped);
      await addToWaitQ(mockClient_Two.Client, mockClient_Two.Department, mockClient_Two.Communication, mockClient_Two.Problem, mockClient_Two.Qno, mockClient_Two.queueDropped);
      await addToWaitQ(mockClient_Three.Client, mockClient_Three.Department, mockClient_Three.Communication, mockClient_Three.Problem, mockClient_Three.Qno, mockClient_Three.queueDropped);
      await addToWaitQ(mockClient_Four.Client, mockClient_Four.Department, mockClient_Four.Communication, mockClient_Four.Problem, mockClient_Four.Qno, mockClient_Four.queueDropped);
      await addToWaitQ(mockClient_Six.Client, mockClient_Six.Department, mockClient_Six.Communication, mockClient_Six.Problem, mockClient_Six.Qno, mockClient_Six.queueDropped);
      await addToWaitQ(mockClient_Seven.Client, mockClient_Seven.Department, mockClient_Seven.Communication, mockClient_Seven.Problem, mockClient_Seven.Qno, mockClient_Seven.queueDropped);
      await addToWaitQ(mockClient_Eight.Client, mockClient_Eight.Department, mockClient_Eight.Communication, mockClient_Eight.Problem, mockClient_Eight.Qno, mockClient_Eight.queueDropped);
      await splitWaitQ("Graduate Office");
      await handleQueueDrop("Graduate Office", 6, "ChatQ");
      let ChatQ = await getCurrentQ("Graduate Office", "ChatQ");
      expect(ChatQ).toStrictEqual([mockClient_One, mockClient_Four, mockClient_Seven, mockClient_Eight]);
    })

    it('QUEUES COLLECTION | handleQueueDrop(department, Qno, QueueType) - OtherQ', async() => {
      const QueuesCollection = db.collection('Queues');
      await resetQ("Graduate Office");
      await addToWaitQ(mockClient_One.Client, mockClient_One.Department, mockClient_One.Communication, mockClient_One.Problem, mockClient_One.Qno, mockClient_One.queueDropped);
      await addToWaitQ(mockClient_Two.Client, mockClient_Two.Department, mockClient_Two.Communication, mockClient_Two.Problem, mockClient_Two.Qno, mockClient_Two.queueDropped);
      await addToWaitQ(mockClient_Three.Client, mockClient_Three.Department, mockClient_Three.Communication, mockClient_Three.Problem, mockClient_Three.Qno, mockClient_Three.queueDropped);
      await addToWaitQ(mockClient_Four.Client, mockClient_Four.Department, mockClient_Four.Communication, mockClient_Four.Problem, mockClient_Four.Qno, mockClient_Four.queueDropped);
      await addToWaitQ(mockClient_Six.Client, mockClient_Six.Department, mockClient_Six.Communication, mockClient_Six.Problem, mockClient_Six.Qno, mockClient_Six.queueDropped);
      await addToWaitQ(mockClient_Seven.Client, mockClient_Seven.Department, mockClient_Seven.Communication, mockClient_Seven.Problem, mockClient_Seven.Qno, mockClient_Seven.queueDropped);
      await addToWaitQ(mockClient_Eight.Client, mockClient_Eight.Department, mockClient_Eight.Communication, mockClient_Eight.Problem, mockClient_Eight.Qno, mockClient_Eight.queueDropped);
      await splitWaitQ("Graduate Office");
      await handleQueueDrop("Graduate Office", 4, "OtherQ");
      let OtherQ = await getCurrentQ("Graduate Office", "OtherQ")
      expect(OtherQ).toStrictEqual([mockClient_Two]);
    })

    it('QUEUES COLLECTION | handleQueueDrop(department, Qno, QueueType) - MainQ', async() => {
      const QueuesCollection = db.collection('Queues');
      await resetQ("Graduate Office");
      await addToWaitQ(mockClient_One.Client, mockClient_One.Department, mockClient_One.Communication, mockClient_One.Problem, mockClient_One.Qno, mockClient_One.queueDropped);
      await addToWaitQ(mockClient_Two.Client, mockClient_Two.Department, mockClient_Two.Communication, mockClient_Two.Problem, mockClient_Two.Qno, mockClient_Two.queueDropped);
      await addToWaitQ(mockClient_Three.Client, mockClient_Three.Department, mockClient_Three.Communication, mockClient_Three.Problem, mockClient_Three.Qno, mockClient_Three.queueDropped);
      await addToWaitQ(mockClient_Four.Client, mockClient_Four.Department, mockClient_Four.Communication, mockClient_Four.Problem, mockClient_Four.Qno, mockClient_Four.queueDropped);
      await addToWaitQ(mockClient_Six.Client, mockClient_Six.Department, mockClient_Six.Communication, mockClient_Six.Problem, mockClient_Six.Qno, mockClient_Six.queueDropped);
      await addToWaitQ(mockClient_Seven.Client, mockClient_Seven.Department, mockClient_Seven.Communication, mockClient_Seven.Problem, mockClient_Seven.Qno, mockClient_Seven.queueDropped);
      await addToWaitQ(mockClient_Eight.Client, mockClient_Eight.Department, mockClient_Eight.Communication, mockClient_Eight.Problem, mockClient_Eight.Qno, mockClient_Eight.queueDropped);
      await splitWaitQ("Graduate Office");
      await handleQueueDrop("Graduate Office", 4, "Main Queue");
      let MainQ = await getCurrentQ("Graduate Office", "Main Queue")
      expect(MainQ).toStrictEqual([mockClient_One, mockClient_Two, mockClient_Four, mockClient_Six, mockClient_Seven, mockClient_Eight]);
    })

    it('QUEUES COLLECTION | addDroppQEvent(department, Qno)', async() => {
      const QueuesCollection = db.collection('Queues');
      await resetQ("Graduate Office");
      await addDroppQEvent("Graduate Office", mockClient_One.Qno);
      let DropQEventHandler = await getCurrentQ("Graduate Office", "DropQEventHandler");
      expect(DropQEventHandler[0].Qno).toStrictEqual(mockClient_One.Qno);
      expect(DropQEventHandler[0].DropQHandled).toStrictEqual(false);
    })

    it('QUEUES COLLECTION | updateDropQHandler(department)', async() => {
      const QueuesCollection = db.collection('Queues');
      await resetQ("Graduate Office");
      await addDroppQEvent("Graduate Office", mockClient_One.Qno);
      await addDroppQEvent("Graduate Office", mockClient_Two.Qno);
      await updateDropQHandler("Graduate Office");
      let DropQEventHandler = await getCurrentQ("Graduate Office", "DropQEventHandler");
      expect(DropQEventHandler[0].Qno).toStrictEqual(mockClient_Two.Qno);
    })

    it('QUEUES COLLECTION | getQueueNumber(department, queueNumber)', async() => {
      const QueuesCollection = db.collection('Queues');
      await resetQ("Graduate Office");
      await addToWaitQ(mockClient_One.Client, mockClient_One.Department, mockClient_One.Communication, mockClient_One.Problem, mockClient_One.Qno, mockClient_One.queueDropped);
      await addToWaitQ(mockClient_Two.Client, mockClient_Two.Department, mockClient_Two.Communication, mockClient_Two.Problem, mockClient_Two.Qno, mockClient_Two.queueDropped);
      await addToWaitQ(mockClient_Three.Client, mockClient_Three.Department, mockClient_Three.Communication, mockClient_Three.Problem, mockClient_Three.Qno, mockClient_Three.queueDropped);
      await addToWaitQ(mockClient_Four.Client, mockClient_Four.Department, mockClient_Four.Communication, mockClient_Four.Problem, mockClient_Four.Qno, mockClient_Four.queueDropped);
      await addToWaitQ(mockClient_Six.Client, mockClient_Six.Department, mockClient_Six.Communication, mockClient_Six.Problem, mockClient_Six.Qno, mockClient_Six.queueDropped);
      await addToWaitQ(mockClient_Seven.Client, mockClient_Seven.Department, mockClient_Seven.Communication, mockClient_Seven.Problem, mockClient_Seven.Qno, mockClient_Seven.queueDropped);
      await addToWaitQ(mockClient_Eight.Client, mockClient_Eight.Department, mockClient_Eight.Communication, mockClient_Eight.Problem, mockClient_Eight.Qno, mockClient_Eight.queueDropped);
      let MainQ = await getCurrentQ("Graduate Office", "Main Queue");
      let Qno = await getQueueNumber(mockClient_Six.Department, mockClient_Six.Qno);
      expect(Qno).toBe(4);
    })


})
