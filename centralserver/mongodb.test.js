const {MongoClient} = require('mongodb');


describe('TEST: Agent Collection', () => {
         let connection;
         let db;

         beforeAll(async () => {
                   connection = await MongoClient.connect(process.env.MONGO_URL, {
                                                          useNewUrlParser: true,
                                                          useUnifiedTopology: true
                                                          });
                   db = await connection.db();
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
         'availability' : true,
         'typeOfComm' : ["Chat", "Video", "Audio"],
         'currentActiveSessions' : 0,
         'reserve' : 3
         };
         
         const mockAgent_Three = {
         '_id' : 'AAC',
         'jid' : 'some-jid',
         'Department_id' : 'Graduate Office',
         'name' : 'Johnson',
         'availability' : true,
         'typeOfComm' : ["Audio", "Video", "Chat"],
         'currentActiveSessions' : 0,
         'reserve' : 3
         };
         
         it('AGENT COLLECTION | addAgent(_id, jid, name, typeOfComm, departmentID)', async () => {
            const agent = db.collection('Agent');
            await agent.insertOne(mockAgent_One);
   
            const insertedAgent = await agent.findOne({'jid' : 'some-jid'});
            //console.log(insertedAgent)
            expect(insertedAgent).toEqual(mockAgent_One);
            });
         
         
         it('AGENT COLLECTION | checkRequestedAgents(departmentID, communication)', async() => {
            const agent = db.collection('Agent');
            // insert the 2nd agent.
            await agent.insertOne(mockAgent_Two);
            await agent.insertOne(mockAgent_Three);
            // function implementation
            const result = await agent.find({
                'availability': true,
                'Department_id' : 'Graduate Office',
                'typeOfComm' : 'Chat'
            }).sort({ servicedToday: 1}).toArray();
            
            const expected = [mockAgent_One,mockAgent_Three]
            //console.log(result)
            expect(result).toStrictEqual(expected)
            })
         
         it('AGENT COLLECTION | modifyCommAndDept(typeOfComm, Department_id, newProperties)', async() => {
            const agent = db.collection('Agent');
            let oldProperties = {'typeOfComm' : 'Chat' , 'Department_id' : 'Music Office'};
            let newProperties = {'typeOfComm' : ['Video','Audio','Chat']};
            await agent.updateOne(
                                  oldProperties,
                                  {$set: newProperties})
            const result = await agent.findOne({
                                            'typeOfComm' : ['Video','Audio','Chat']
                                            })
            const expected = {
                              _id: 'AAB',
                              jid: 'another_jid',
                              Department_id: 'Music Office',
                              name: 'Mariah Carrey',
                              availability: true,
                              typeOfComm: [ 'Video', 'Audio', 'Chat' ],
                              currentActiveSessions: 0,
                              reserve: 3}
            expect(result).toStrictEqual(expected)
         })
         
         it('AGENT COLLECTION | incrementAgentSession(jid)', async() => {
            const agent = db.collection('Agent');
            const jid = 'another_jid'
            let JSONObj = await agent.findOne(
                                              {'jid' : jid},
                                              {projection : {
                                              'currentActiveSessions' : 1 ,
                                              'reserve' : 1
                                              }});
            if (JSONObj == null) {
                console.log("TEST | incrementAgentSession | Wrong JID input");
                return false;
            }
            if (JSONObj.currentActiveSessions < JSONObj.reserve) {
            let newActiveSession = JSONObj.currentActiveSessions +=1;
            await agent.updateOne({'jid' : jid},
                                  {$set: {'currentActiveSessions' : newActiveSession}})
            
            console.log("Number of Session has been incremented")
            
            }
            else {
                console.log("Please wait. Current CSA is working at maximum capacity")
            }
            
            const result = await agent.findOne(
                                               {'jid' : jid},
                                               {projection : {
                                               'currentActiveSessions' : 1 ,
                                               }});
            expect(result.currentActiveSessions).toBe(1)
            })
        
         
         
});

