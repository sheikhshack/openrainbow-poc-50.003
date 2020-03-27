const {MongoClient} = require('mongodb');

// TEST Pending Collections
describe('TEST: Pending Collection', () => {
         let connection;
         let db;

         beforeAll(async () => {
                   connection = await MongoClient.connect(process.env.MONGO_URL, {
                                                          useNewUrlParser: true,
                                                          useUnifiedTopology: true
                                                          });
                   db = await connection.db();
                   await db.collection('PendingRequests').deleteMany({});
                   
                   });

         afterAll(async () => {
                  await connection.close();
                  });
         
         const mockClient_One = {
         'userEmail'     : 'tonkie@gmail.com.sg',
         'Department_id' : 'Graduate Office',
         'Enquiry'       : 'I need some help in blablabla'
         }
         
         const mockClient_Two = {
         'userEmail'     : 'william@gmail.com.sg',
         'Department_id' : 'HASS Office',
         'Enquiry'       : "I'm abit awkward."
         }
         
         const mockClient_Three = {
         'userEmail'     : 'tohcitybro@gmail.com.sg',
         'Department_id' : 'Student Administration Office',
         'Enquiry'       : "I'd like to enroll into SUTD. Please reply."
         }
         
         it('PENDING COLLECTION | addPendingRequest(userEmail, departmentID, Enquiry)', async() => {
            const pendingCollection = db.collection('PendingRequests');
            
            await pendingCollection.insertOne({
                                              'userEmail' : mockClient_Three.userEmail,
                                              'Department_id' : mockClient_Three.Department_id,
                                              'Enquiry' : mockClient_Three.Enquiry,
                                              'TimeStamp' : String(new Date())
                                              })

            const result = await pendingCollection.findOne({
                                                           'userEmail': 'tohcitybro@gmail.com.sg'
                                                           })
            
            expect(result.userEmail).toBe(mockClient_Three.userEmail)
            expect(result.Department_id).toBe(mockClient_Three.Department_id)
            expect(result.Enquiry).toBe(mockClient_Three.Enquiry)
            })
         
         it('PENDING COLLECTION | addPendingRequest(userEmail, departmentID, Enquiry)', async() => {
         const pendingCollection = db.collection('PendingRequests');
         
         await pendingCollection.insertOne({
                                           'userEmail' : mockClient_Three.userEmail,
                                           'Department_id' : mockClient_Three.Department_id,
                                           'Enquiry' : mockClient_Three.Enquiry,
                                           'TimeStamp' : String(new Date())
                                           })

         const result = await pendingCollection.findOne({
                                                        'userEmail': 'tohcitybro@gmail.com.sg'
                                                        })
         
         expect(result.userEmail).toBe(mockClient_Three.userEmail)
         expect(result.Department_id).toBe(mockClient_Three.Department_id)
         expect(result.Enquiry).toBe(mockClient_Three.Enquiry)
         })
         
         
         })
