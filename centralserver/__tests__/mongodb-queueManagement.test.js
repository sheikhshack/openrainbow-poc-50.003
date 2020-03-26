const {MongoClient} = require('mongodb');

// TEST Queue Management Functions

describe('TEST: Agent Collection', () => {
         let connection;
         let db;
         
         const mockDpt_One = {
         '_id' : 'General Enquiry',
         'number_of_agents' : 2,
         'currentQueueNumber' : 0,
         'totalActiveRequests' : 0,
         'servicedRequests' : 0,
         'failedRequests' : 0,
         'servicedToday' : 0
         }
         
         const mockDpt_Two = {
         '_id' : 'Student Administration',
         'number_of_agents' : 2,
         'currentQueueNumber' : 2,
         'totalActiveRequests' : 11,
         'servicedRequests' : 1,
         'failedRequests' : 0,
         'servicedToday' : 1
         }

         beforeAll(async () => {
                   connection = await MongoClient.connect(process.env.MONGO_URL, {
                                                          useNewUrlParser: true,
                                                          useUnifiedTopology: true
                                                          });
                   db = await connection.db();
                   const Dpt_One = db.collection(mockDpt_One._id);
                   await Dpt_One.insertOne(mockDpt_One);
                   
                   const Dpt_Two = db.collection(mockDpt_Two._id);
                   await Dpt_Two.insertOne(mockDpt_Two);
                   
                   });

         afterAll(async () => {
                  await connection.close();
                  });
         
         
         it('QUEUE | getDepartmentCurrentQueueNumber(departmentID)', async()=> {
            const Dpt_One = db.collection(mockDpt_One._id);
            let One = await Dpt_One.findOne({
                                            '_id' : mockDpt_One._id
                                            });
            const Dpt_Two = db.collection(mockDpt_Two._id);
            let Two = await Dpt_Two.findOne({
                                            '_id' : mockDpt_Two._id
                                            })
            // maybe next time can write some functions to increase and decrease queue to check on the queue number
            expect(One.currentQueueNumber).toBe(0)
            expect(Two.currentQueueNumber).toBe(2)
            })
         
         
         it('QUEUE | incrementDepartmentCurrentQueueNumber(departmentID)', async() => {
            const Dpt_One = db.collection(mockDpt_One._id);
            console.log(Dpt_One)
            await Dpt_One.updateOne(
                                    {'_id' : departmentID},
                                    {$inc:
                                    {'servicedRequests' : 1, 'currentQueueNumber': 1}},
                                    }
                                    
            })
         
         
         
         
         
         })
