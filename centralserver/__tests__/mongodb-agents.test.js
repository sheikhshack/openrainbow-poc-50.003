const {MongoClient} = require('mongodb');

// TEST Agent Collection
describe('TEST: Agent Collection', () => {
         let connection;
         let db;


         async function addAgent(_id, jid, name, typeOfComm, departmentID){

             await db.collection('Agent').insertOne({'_id' : _id,
                                                    'jid' : jid,
                                                    'Department_id' : departmentID,
                                                    'name' : name,
                                                    'availability' : true,
                                                    'typeOfComm' : typeOfComm,
                                                    'currentActiveSessions' : 0,
                                                    'reserve' : 3,
                                                    'servicedToday' : 0,
                                                    'currentlyInRtc' : false
                                                    }, function(err, res) {
                                                    if (err) throw err;
                                                    })
         }

         async function checkRequestedAgents(departmentID, communication) {
              // Get the Departments collection
              let result = await db.collection('Agent').find({'availability': true,
                                                             'Department_id' : departmentID,
                                                             'typeOfComm' : communication
                                                             }).sort({ servicedToday: 1}).toArray();
              return result;
         }

         async function modifyCommAndDept(jid, newProperties) {
         await db.collection('Agent').updateOne({'jid' : jid},
                                                    {$set: newProperties},
                                                    function(err, res) {
                                                    if (err) throw err;
                                                    })
         }

         async function incrementAgentSession(jid) {
         let JSONObj = await db.collection('Agent').findOne({'jid' : jid},
                                                            {projection : {
                                                            'currentActiveSessions' : 1 ,
                                                            'reserve' : 1}});
         if (JSONObj == null) {
         // console.log("Wrong JID input");
         return false;
         }
         if (JSONObj.currentActiveSessions < JSONObj.reserve ) {
         let newActiveSession = JSONObj.currentActiveSessions +=1;
         // console.log(newActiveSession);

         await db.collection('Agent').updateOne({'jid' : jid},
                                                {$set: {'currentActiveSessions' : newActiveSession}},
                                                function(err, res) {
                                                if (err) throw err;

                                                return true;
                                                })

         }
         else {
         // console.log("Please wait. Current CSA is working at maximum capacity");
         return false;
         }
         }

         async function checkAgentSession(jid) {
             // returns a document that supports JSON format.
             let JSONObj = await db.collection('Agent').findOne(
                                                                {'jid': jid},
                                                                {projection: {
                                                                'currentActiveSessions': 1,
                                                                'reserve': 1}});


             if (JSONObj.currentActiveSessions < JSONObj.reserve) {
                 return true;
             } else {
                 // console.log("Please wait. Current CSA is working at maximum capacity");
                 return false;
             }

         }

         async function toggleAvail(jid) {
             // First check the availability of the CSA
            let JSONObj = await db.collection('Agent').findOne({'jid' : jid},
                                                               {projection : {
                                                               'availability' : 1 ,
                                                               '_id' : 1}})
             //console.log(JSONObj.getTimeStamp())
             if (JSONObj == null) {
                 // console.log("Wrong JID input")
                 return
             }

             if (JSONObj.availability == false) {
                 // console.log("CSA agent is still unavailable. Please wait a while more")
             }
             await db.collection('Agent').updateOne({'jid' : jid},
                                                    {$set: {'availability' : false}},
                                                    function(err, res) {
                                                    if (err) throw err;
                                                    })
         }

         async function currentlyInRtc(agentJID){
           let currentlyInRtc = await db.collection('Agent').findOne(
             {'jid' : agentJID},
             {projection: {'currentlyInRtc' : 1}})
           return currentlyInRtc.currentlyInRtc
         }

         async function updateAgentcurrentlyInRtcStatus(Department, agentJID, currentlyInRtc){
           if (currentlyInRtc) {
             await db.collection('Agent').updateOne(
               {'jid' : agentJID},
               {$set : {'currentlyInRtc' : false}})
           }
           else if (!currentlyInRtc) {
             await db.collection('Agent').updateOne(
               {'jid' : agentJID},
               {$set : {'currentlyInRtc' : true}})
           }
         }



         beforeAll(async () => {

                   connection = await MongoClient.connect(process.env.MONGO_URL, {
                                                          useNewUrlParser: true,
                                                          useUnifiedTopology: true
                                                          });
                   db = await connection.db();
                   await db.collection('Agent').deleteMany({});
                   await db.collection('PendingRequests').deleteMany({});
                   await db.collection('Department').deleteMany({});
                   });

         afterAll(async () => {
                  await connection.close();


                  });

         const agent1 = {
         '_id' : 'ASDASDS',
         'jid' : 'some-jid',
         'Department_id' : 'Graduate Office',
         'name' : 'Michael',
         'availability' : true,
         'typeOfComm' : ["Chat", "Audio"],
         'currentActiveSessions' : 0,
         'reserve' : 3,
         'servicedToday' : 0,
         'currentlyInRtc' : false
         };

         const agent2 = {
         '_id' : 'AAB',
         'jid' : 'another_jid',
         'Department_id' : 'Music Office',
         'name' : 'Mariah Carrey',
         'availability' : false,
         'typeOfComm' : ["Chat", "Video", "Audio"],
         'currentActiveSessions' : 0,
         'reserve' : 3,
         'servicedToday' : 0,
         'currentlyInRtc' : false
         };

         const agent3 = {
         '_id' : 'AAC',
         'jid' : 'third-jid',
         'Department_id' : 'Graduate Office',
         'name' : 'Johnson',
         'availability' : true,
         'typeOfComm' : ["Audio", "Video", "Chat"],
         'currentActiveSessions' : 0,
         'reserve' : 3,
         'servicedToday' : 0,
         'currentlyInRtc' : false
         };

         const agent4 = {
         '_id' : 'AAD',
         'jid' : 'overloaded-jid',
         'Department_id' : 'Finance Office',
         'name' : 'Daddy Johson',
         'availability' : true,
         'typeOfComm' : ["Audio", "Video", "Chat"],
         'currentActiveSessions' : 3,
         'reserve' : 3,
         'servicedToday' : 0,
         'currentlyInRtc' : true
         };


         it('AGENT COLLECTION | addAgent(_id, jid, name, typeOfComm, departmentID)', async () => {
            const agent = db.collection('Agent');
            await addAgent(agent1._id,agent1.jid,agent1.name,agent1.typeOfComm,agent1.Department_id)

            const insertedAgent = await agent.findOne({'_id' : agent1._id});
            expect(insertedAgent).toStrictEqual(agent1);
            });


         it('AGENT COLLECTION | checkRequestedAgents(departmentID, communication)', async() => {
            const agent = db.collection('Agent');
            // insert the 2nd agent.
            // await agent.insertOne(agent1);
            await agent.insertOne(agent3);
            // function implementation
            let agentList = await checkRequestedAgents('Graduate Office', 'Chat');
            let expected = [agent1,agent3]
            expect(agentList).toStrictEqual(expected)
            })

         it('AGENT COLLECTION | modifyCommAndDept(typeOfComm, Department_id, newProperties)', async() => {
            const agent = db.collection('Agent');
            await agent.insertOne(agent4);
            let newProperties = {"typeOfComm" : ['Video','Audio','Chat']};
            await modifyCommAndDept(agent4.jid, newProperties)
            const result = await agent.findOne({'jid' : agent4.jid},
                                               {projection: {'typeOfComm': 1}})
            expect(result.typeOfComm).toEqual(newProperties['typeOfComm'])
         })

         it('AGENT COLLECTION | incrementAgentSession(jid)', async() => {
            const agent = db.collection('Agent');
            // await agent.insertOne(agent3);
            await incrementAgentSession(agent3.jid);

            let result = await agent.findOne({'jid': agent3.jid},
                                             {projection:
                                             {'currentActiveSessions' : 1}})
            expect(result.currentActiveSessions).toBe(1)
            })


         it('AGENT COLLECTION | incrementAgentSession(jid) - OVERLOAD AGENT', async() => {
            const agent = db.collection('Agent');
            // await agent.insertOne(agent4);
            await incrementAgentSession(agent4.jid);
            let result = await agent.findOne({'jid': agent4.jid},
                                             {projection:
                                             {'currentActiveSessions' : 1}})
            expect(result.currentActiveSessions).toBe(3);
         })

         it('AGENT COLLECTION | checkAgentSession(jid)', async()=> {
            const agent = db.collection('Agent');
            // await agent.insertOne(agent4);
            // await agent.insertOne(agent1);


            let agentSession_Pass = await checkAgentSession(agent1.jid);
            let agentSession_Fail = await checkAgentSession(agent4.jid);

            expect(agentSession_Pass).toBe(true)
            expect(agentSession_Fail).toBe(false)
            })


         it('AGENT COLLECTION | toggleAvail(jid)', async() => {
            const agent = db.collection('Agent')
            // should print out "CSA agent is still unavailable. Please wait a while more"
            agent.insertOne(agent2)
            // agent.insertOne(agent1)
            await toggleAvail(agent2.jid)
            await toggleAvail(agent1.jid)

            let agentOne = await agent.findOne({'jid' : agent1.jid},
                                         {projection:
                                         {'availability' : 1}})

            let agentTwo = await agent.findOne({'jid' : agent2.jid},
            {projection:
            {'availability' : 1}})

            expect(agentTwo.availability).toBe(false)
            expect(agentOne.availability).toBe(false)
            })

          it('AGENT COLLECTION | currentlyInRtc(agentJID)', async() => {
             const agent = db.collection('Agent')
             // await agent.insertOne(agent4);
             let status = await currentlyInRtc(agent4.jid)
             expect(status).toBe(true);
             })

         it('AGENT COLLECTION | updateAgentcurrentlyInRtcStatus(Department, agentJID, currentlyInRtc)', async() => {
            const agent = db.collection('Agent')
            // await agent.insertOne(agent4);
            await updateAgentcurrentlyInRtcStatus(agent4.Department_id, agent4.jid, agent4.currentlyInRtc)
            let status = await currentlyInRtc(agent4.jid)
            expect(status).toBe(false);
            })


});
