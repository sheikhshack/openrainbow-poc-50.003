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
                                                    'reserve' : 3
                                                    }, function(err, res) {
                                                    if (err) throw err;
                                                    console.log("Document inserted")})
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
                                                    console.log("Update Compelete.")})
         }
         
         async function incrementAgentSession(jid) {
         let JSONObj = await db.collection('Agent').findOne({'jid' : jid},
                                                            {projection : {
                                                            'currentActiveSessions' : 1 ,
                                                            'reserve' : 1}});
         if (JSONObj == null) {
         console.log("Wrong JID input");
         return false;
         }
         if (JSONObj.currentActiveSessions < JSONObj.reserve ) {
         let newActiveSession = JSONObj.currentActiveSessions +=1;
         console.log(newActiveSession);
                 
         await db.collection('Agent').updateOne({'jid' : jid},
                                                {$set: {'currentActiveSessions' : newActiveSession}},
                                                function(err, res) {
                                                if (err) throw err;
                                                console.log("Number of Session has been incremented.");
                                                return true;
                                                })
         
         }
         else {
         console.log("Please wait. Current CSA is working at maximum capacity");
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
                 console.log("Please wait. Current CSA is working at maximum capacity");
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
                 console.log("Wrong JID input")
                 return
             }
             
             if (JSONObj.availability == false) {
                 console.log("CSA agent is still unavailable. Please wait a while more")
             }
             await db.collection('Agent').updateOne({'jid' : jid},
                                                    {$set: {'availability' : false}},
                                                    function(err, res) {
                                                    if (err) throw err;
                                                    console.log("CSA is now available")})
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
         
         const mockAgent_One = {
         '_id' : 'AAA',
         'jid' : 'some-jid',
         'Department_id' : 'Graduate Office',
         'name' : 'Michael',
         'availability' : true,
         'typeOfComm' : ["Chat", "Audio"],
         'currentActiveSessions' : 0,
         'reserve' : 3
         };
         
         const mockAgent_Two = {
         '_id' : 'AAB',
         'jid' : 'another_jid',
         'Department_id' : 'Music Office',
         'name' : 'Mariah Carrey',
         'availability' : false,
         'typeOfComm' : ["Chat", "Video", "Audio"],
         'currentActiveSessions' : 0,
         'reserve' : 3
         };
         
         const mockAgent_Three = {
         '_id' : 'AAC',
         'jid' : 'third-jid',
         'Department_id' : 'Graduate Office',
         'name' : 'Johnson',
         'availability' : true,
         'typeOfComm' : ["Audio", "Video", "Chat"],
         'currentActiveSessions' : 0,
         'reserve' : 3
         };
         
         const mockAgent_Four = {
         '_id' : 'AAD',
         'jid' : 'overloaded-jid',
         'Department_id' : 'Finance Office',
         'name' : 'Daddy Johson',
         'availability' : true,
         'typeOfComm' : ["Audio", "Video", "Chat"],
         'currentActiveSessions' : 3,
         'reserve' : 3
         };
         
         
         it('AGENT COLLECTION | addAgent(_id, jid, name, typeOfComm, departmentID)', async () => {
            const agent = db.collection('Agent');
            await addAgent(mockAgent_One._id,mockAgent_One.jid,mockAgent_One.name,mockAgent_One.typeOfComm,mockAgent_One.Department_id)
   
            const insertedAgent = await agent.findOne({'jid' : 'some-jid'});
            //console.log(insertedAgent)
            expect(insertedAgent).toStrictEqual(mockAgent_One);
            });
         
         
         it('AGENT COLLECTION | checkRequestedAgents(departmentID, communication)', async() => {
            const agent = db.collection('Agent');
            // insert the 2nd agent.
            await agent.insertOne(mockAgent_Three);
            // function implementation
            let agentList = await checkRequestedAgents('Graduate Office', 'Chat');
            let expected = [mockAgent_One,mockAgent_Three]
            expect(agentList).toStrictEqual(expected)
            })
         
         it('AGENT COLLECTION | modifyCommAndDept(typeOfComm, Department_id, newProperties)', async() => {
            const agent = db.collection('Agent');
            await agent.insertOne(mockAgent_Four);
            let newProperties = {"typeOfComm" : ['Video','Audio','Chat']};
            await modifyCommAndDept(mockAgent_Four.jid, newProperties)
            const result = await agent.findOne({'jid' : 'overloaded-jid'},
                                               {projection: {'typeOfComm': 1}})
            expect(result.typeOfComm).toEqual(newProperties['typeOfComm'])
         })
         
         it('AGENT COLLECTION | incrementAgentSession(jid)', async() => {
            const agent = db.collection('Agent');
            await incrementAgentSession(mockAgent_Three.jid);
            
            let result = await agent.findOne({'jid': mockAgent_Three.jid},
                                             {projection:
                                             {'currentActiveSessions' : 1}})
            expect(result.currentActiveSessions).toBe(1)
            })
         
         
         it('AGENT COLLECTION | incrementAgentSession(jid) - OVERLOAD AGENT', async() => {
            const agent = db.collection('Agent');
            await incrementAgentSession(mockAgent_Four.jid);
            let result = await agent.findOne({'jid': mockAgent_Four.jid},
                                             {projection:
                                             {'currentActiveSessions' : 1}})
            expect(result.currentActiveSessions).toBe(3);
         })
         
         it('AGENT COLLECTION | checkAgentSession(jid)', async()=> {
            const agent = db.collection('Agent');
            
            
            let agentSession_Pass = await checkAgentSession(mockAgent_One.jid);
            let agentSession_Fail = await checkAgentSession(mockAgent_Four.jid);
            
            expect(agentSession_Pass).toBe(true)
            expect(agentSession_Fail).toBe(false)
            })
            
         
         it('AGENT COLLECTION | toggleAvail(jid)', async() => {
            const agent = db.collection('Agent')
            // should print out "CSA agent is still unavailable. Please wait a while more"
            agent.insertOne(mockAgent_Two)
            await toggleAvail(mockAgent_Two.jid)
            await toggleAvail(mockAgent_One.jid)
            
            let agentOne = await agent.findOne({'jid' : mockAgent_One.jid},
                                         {projection:
                                         {'availability' : 1}})
            
            let agentTwo = await agent.findOne({'jid' : mockAgent_Two.jid},
            {projection:
            {'availability' : 1}})
        
            expect(agentTwo.availability).toBe(false)
            expect(agentOne.availability).toBe(false)
            })
            
         
         
         
});

