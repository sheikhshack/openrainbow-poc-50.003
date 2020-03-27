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
         
         async function incrementDepartmentCurrentQueueNumber(departmentID){
            await db.collection('Department').updateOne(
                 {'_id' : departmentID},
                 {$inc: {'servicedRequests' : 1, 'currentQueueNumber': 1}},
                 function(err, res) {
                     if (err) throw err;
                 })
         }
         
         async function getDepartmentCurrentQueueNumber(departmentID){
            let result = await db.collection('Department').findOne({
                 '_id' : departmentID
             });
             //console.log(result.currentQueueNumber);
             return result.currentQueueNumber;
         }
         
         async function getAndSetDepartmentLatestActiveRequestNumber(departmentID){
             let result = await db.collection('Department').findOneAndUpdate({'_id': departmentID },
                                                                             {$inc: {'totalActiveRequests' : 1}
                                                                             });
             return result.value.totalActiveRequests;
         }
         
        
         beforeAll(async () => {
                   connection = await MongoClient.connect(process.env.MONGO_URL, {
                                                          useNewUrlParser: true,
                                                          useUnifiedTopology: true
                                                          });
                   db = await connection.db();
                   
                   const Dpt = db.collection('Department');
                   // add the 2 departments into the Department Collection
                   await Dpt.insertOne(mockDpt_One);
                   await Dpt.insertOne(mockDpt_Two);

                   });

         afterAll(async () => {
                  await connection.close();
                  });
         
         
         it('QUEUE | getDepartmentCurrentQueueNumber(departmentID)', async()=> {
            const Dpt = db.collection('Department');
            const Dpt_One = await getDepartmentCurrentQueueNumber(mockDpt_One._id)
            const Dpt_Two = await getDepartmentCurrentQueueNumber(mockDpt_Two._id)
            // maybe next time can write some functions to increase and decrease queue to check on the queue number
            expect(Dpt_One).toBe(0)
            expect(Dpt_Two).toBe(2)
            })
         
         
         it('QUEUE | incrementDepartmentCurrentQueueNumber(departmentID)', async() => {
            const Dpt = db.collection('Department');
            incrementDepartmentCurrentQueueNumber(mockDpt_One._id);
            
            const result = await Dpt.findOne({'_id' : mockDpt_One._id},
                                             {projection :
                                             {'currentQueueNumber' : 1}})
            for (var i=0; i<4;i++) {
               await incrementDepartmentCurrentQueueNumber(mockDpt_One._id)
            }
            
            const another = await Dpt.findOne({'_id' : mockDpt_One._id},
                                              {projection :
                                              {'currentQueueNumber' : 1}})
                
            expect(result.currentQueueNumber).toBe(1)
            expect(another.currentQueueNumber).toBe(5)
            })
         
//         it('QUEUE | getAndSetDepartmentLatestActiveRequestNumber(departmentID)', async() => {
//            const Dpt = db.collection('Department');
//            let activeRequests = await getAndSetDepartmentLatestActiveRequestNumber(mockDpt_Two._id);
//            console.log(activeRequests)
//            console.log("safsfasdfasdfasdfsds")
//            expect(activeRequests).toBe(12)
//            })
         
         })
