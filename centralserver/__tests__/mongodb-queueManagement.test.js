const {MongoClient} = require('mongodb');

// TEST Queue Management Functions

describe('TEST: QUEUE MANAGEMENT', () => {
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
         '_id' : 'Graduate Office',
         'number_of_agents' : 2,
         'currentQueueNumber' : 2,
         'totalActiveRequests' : 11,
         'servicedRequests' : 1,
         'failedRequests' : 0,
         'servicedToday' : 1
         }
         
         const mockAgent_One = {
         '_id' : 'ABA',
         'jid' : 'some-jid',
         'Department_id' : 'Graduate Office',
         'name' : 'Michael',
         'availability' : true,
         'typeOfComm' : ["Chat", "Audio"],
         'currentActiveSessions' : 2,
         'reserve' : 3,
         'servicedToday' : 2
         };
         
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
                                                                                     'servicedToday' : 0
                                                                                     }})
         }
        
         beforeAll(async () => {
                   
                   connection = await MongoClient.connect(process.env.MONGO_URL, {
                                                          useNewUrlParser: true,
                                                          useUnifiedTopology: true
                                                          });
                   db = await connection.db();
                   await db.collection('Agent').deleteMany({});
                   await db.collection('Department').deleteMany({});
                   const Dpt = db.collection('Department');
                   const agent = db.collection('Agent');
                   await db.collection('PendingRequests').deleteMany({});
                   // add the 2 departments into the Department Collection
                   await Dpt.insertOne(mockDpt_One);
                   await Dpt.insertOne(mockDpt_Two);
                   // add agent to Agent collection
                   await agent.insertOne(mockAgent_One);
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
         
         it('QUEUE | getAndSetDepartmentLatestActiveRequestNumber(departmentID)', async() => {
            const Dpt = db.collection('Department');
            let currentActiveReq = await getAndSetDepartmentLatestActiveRequestNumber(mockDpt_Two._id);
            
            let updatedActiveReq = await Dpt.findOne({'_id': mockDpt_Two._id},
                                                     {projection :
                                                     {'totalActiveRequests': 1}
                                                     })
            
            expect(currentActiveReq).toBe(11)
            expect(updatedActiveReq.totalActiveRequests).toBe(12)
            })
         
         it('QUEUE | completedARequest(jid, departmentID)', async() => {
            const Dpt = db.collection('Department');
            const agent = db.collection('Agent');
            await completedARequest(mockAgent_One.jid, mockAgent_One.Department_id);
            
            let checkAgent = await agent.findOne({'_id': mockAgent_One._id},
                                               {projection:
                                               {'currentActiveSessions' : 1, 'servicedToday' : 1
                                               }})
            expect(checkAgent.currentActiveSessions).toBe(1)
            expect(checkAgent.servicedToday).toBe(3)
            })
         
         
         
         it('RESET | reset()', async() =>{
            const Dpt = db.collection('Department');
            const agent = db.collection('Agent');
            
            await reset()
            let currentDptCollection = await Dpt.find()
            let currentAgentCollection = await agent.find()

            const Dpts_Updated =
              [{
                '_id': 'General Enquiry',
                'number_of_agents': 2,
                'currentQueueNumber': 0,
                'totalActiveRequests': 0,
                'servicedRequests': 0,
                'failedRequests': 0,
                'servicedToday': 0
              },
              {
                '_id': 'Graduate Office',
                'number_of_agents': 2,
                'currentQueueNumber': 0,
                'totalActiveRequests': 0,
                'servicedRequests': 0,
                'failedRequests': 0,
                'servicedToday': 0
              }]
            
            const Agents_Updated =
            [{
                _id: 'ABA',
                jid: 'some-jid',
                Department_id: 'Graduate Office',
                name: 'Michael',
                availability: true,
                typeOfComm: [ 'Chat', 'Audio' ],
                currentActiveSessions: 0,
                reserve: 3,
                servicedToday: 0
              }]
            
            let expected_Dpt = await currentDptCollection.toArray();
            let expected_Agent = await currentAgentCollection.toArray();
            expect(expected_Dpt).toStrictEqual(Dpts_Updated);
            expect(expected_Agent).toStrictEqual(Agents_Updated);
            })
         
         })
