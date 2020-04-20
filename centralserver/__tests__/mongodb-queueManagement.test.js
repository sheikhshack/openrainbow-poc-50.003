const {MongoClient} = require('mongodb');

// TEST Queue Management Functions

describe('TEST: QUEUE MANAGEMENT', () => {
         let connection;
         let db;

         const dpt1 = {
         '_id' : 'General Enquiry',
         'number_of_agents' : 2,
         'currentQueueNumber' : 0,
         'totalActiveRequests' : 0,
         'servicedRequests' : 0,
         'failedRequests' : 0,
         'servicedToday' : 0
         }

         const dpt2 = {
         '_id' : 'Graduate Office',
         'number_of_agents' : 2,
         'currentQueueNumber' : 2,
         'totalActiveRequests' : 11,
         'servicedRequests' : 1,
         'failedRequests' : 0,
         'servicedToday' : 1
         }

         const agents1 = {
         '_id' : 'ABA',
         'jid' : 'some-jid',
         'Department_id' : 'Graduate Office',
         'name' : 'Michael',
         'availability' : true,
         'typeOfComm' : ["Chat", "Audio"],
         'currentActiveSessions' : 2,
         'reserve' : 3,
         'servicedToday' : 2,
         'currentlyInRtc' : false
         };


         async function incrementFailedRequests(department)
         {
           await db.collection('Department').updateOne(
             {"_id" :  department},
             {$inc: {'failedRequests' : 1}})
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
             let result = await db.collection('Department').findOneAndUpdate({'_id': departmentID},
                                                                             {$inc: {'totalActiveRequests' : 1}
                                                                             });
             return result.value.totalActiveRequests;
         }

         async function completedARequest(jid, departmentID){
            let mockagent = await db.collection('Agent').findOne(
                                                               {'jid' : jid},
                                                               {projection : {'currentActiveSessions' : 1}});


            if (mockagent == null) {
                console.log("Wrong JID input");
                return false;

            }

            if (mockagent.currentActiveSessions > 0) {
            // decrement currentActiveSessions by 1
            // increment servicedToday by 1
              await db.collection('Agent').updateOne({'jid' : jid},
                                                     {$inc: {'currentActiveSessions' : -1, 'servicedToday': 1}});
            }

            else { // means that <= 0
            console.log("ERROR : Current Active Session is = 0");
            }


            await db.collection('Department').updateOne(
                                                        {'_id' : departmentID},
                                                        {$inc: {'currentQueueNumber' : 1, 'servicedToday': 1}},
                                                        function(err, res) {
                                                            if (err) throw err;
                                                        });
            return true;
         }


         async function reset(){
             await db.collection('Department').updateMany({},
                 {$set: {
                         'currentQueueNumber' : 0,
                         'totalActiveRequests' : 0,
                         'servicedRequests' : 0,
                         'failedRequests' : 0,
                         'servicedToday' : 0
                     }})
             await db.collection('Agent').updateMany({},
                 {$set: {
                         'currentActiveSessions' : 0,
                         'servicedToday' : 0,
                         'currentlyInRtc' : false
                     }})
         }

         async function decDepartmentLatestActiveRequestNumber(department)
         {
           await db.collection('Department').updateOne(
             {'_id' : department},
             {$inc : {'totalActiveRequests' : -1}})
         }



         beforeAll(async () => {

           connection = await MongoClient.connect(global.__MONGO_URI__, {
                                                  useNewUrlParser: true,
                                                  useUnifiedTopology: true
                                                  });
                  db = await connection.db(global.__MONGO_DB_NAME__);
                   // db = await connection.db();
                   await db.collection('Agent').deleteMany({});
                   await db.collection('Department').deleteMany({});
                   await db.collection('PendingRequests').deleteMany({});
                   await db.collection('Queues').deleteMany({});
                   // add the 2 departments into the Department Collection
                   // add agent to Agent collection
                   });

         afterAll(async () => {
                  await connection.close();
                  // await db.close();

                  });



         it('QUEUE | getDepartmentCurrentQueueNumber(departmentID)', async()=> {
            const Dpt = db.collection('Department');
            await Dpt.insertOne(dpt1);
            await Dpt.insertOne(dpt2);
            const Dpt_One = await getDepartmentCurrentQueueNumber(dpt1._id)
            const Dpt_Two = await getDepartmentCurrentQueueNumber(dpt2._id)
            // maybe next time can write some functions to increase and decrease queue to check on the queue number
            expect(Dpt_One).toBe(0)
            expect(Dpt_Two).toBe(2)
            })


         it('QUEUE | incrementDepartmentCurrentQueueNumber(departmentID)', async() => {
            const Dpt = db.collection('Department');
            // await Dpt.insertOne(dpt1);
            await incrementDepartmentCurrentQueueNumber(dpt1._id);

            const result = await Dpt.findOne({'_id' : dpt1._id},
                                             {projection :
                                             {'currentQueueNumber' : 1}})
            for (var i=0; i<4;i++) {
               await incrementDepartmentCurrentQueueNumber(dpt1._id)
            }

            const another = await Dpt.findOne({'_id' : dpt1._id},
                                              {projection :
                                              {'currentQueueNumber' : 1}})

            expect(result.currentQueueNumber).toBe(1)
            expect(another.currentQueueNumber).toBe(5)
            })

         it('QUEUE | getAndSetDepartmentLatestActiveRequestNumber(departmentID)', async() => {
            const Dpt = db.collection('Department');
            // await Dpt.insertOne(dpt2);
            let currentActiveReq = await getAndSetDepartmentLatestActiveRequestNumber(dpt2._id);

            let updatedActiveReq = await Dpt.findOne({'_id': dpt2._id},
                                                     {projection :
                                                     {'totalActiveRequests': 1}
                                                     })

            expect(currentActiveReq).toBe(11)
            expect(updatedActiveReq.totalActiveRequests).toBe(12)
            })

         it('QUEUE | completedARequest(jid, departmentID)', async() => {
            const Dpt = db.collection('Department');
            const agent = db.collection('Agent');
            await agent.insertOne(agents1);
            await completedARequest(agents1.jid, agents1.Department_id);

            let checkAgent = await agent.findOne({'_id': agents1._id},
                                               {projection:
                                               {'currentActiveSessions' : 1, 'servicedToday' : 1
                                               }})
            expect(checkAgent.currentActiveSessions).toBe(1)
            expect(checkAgent.servicedToday).toBe(3)
            })




        it('Testing decDepartmentLatestActiveRequestNumber', async() =>{
          const Dpt = db.collection('Department');
          // await Dpt.insertOne(dpt2);
          await getAndSetDepartmentLatestActiveRequestNumber(dpt2._id);
          let currentActiveReq = await getAndSetDepartmentLatestActiveRequestNumber(dpt2._id);
          await decDepartmentLatestActiveRequestNumber(dpt2._id);
          let department = await Dpt.findOne({'_id': dpt2._id},
                                             {projection:
                                             {'totalActiveRequests' : 1}})
          expect(department.totalActiveRequests).toBe(13);
        })

        it('Testing incrementFailedRequests(department)', async() =>{
          const Dpt = db.collection('Department');
          // await Dpt.insertOne(dpt2);
          await incrementFailedRequests(dpt2._id);
          let department = await Dpt.findOne({'_id': dpt2._id},
                                             {projection:
                                             {'failedRequests' : 1}})
          expect(department.failedRequests).toBe(1);
        })

         })
