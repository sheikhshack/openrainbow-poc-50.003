const rainbowShake = require('../rainbowShake');
jest.mock('../rainbowShake');


it('create guest function', async ()=> {
  let result = await rainbowShake.createGuests(10800);
  expect(result.loginID).toBe("some Login ID");
  expect(result.loginPass).toBe("some password");
})

it('createGuestWithTokenization', async() =>{
  let token = await rainbowShake.createGuestWithTokenization()
  expect(token).toBe("token")
})

it('createGuestWithName(name, ticketID)' , async() => {
  let name = "Tin Kit"
  let ticketID = "120001"
  let guestUser = await rainbowShake.createGuestWithName(name, ticketID)
  expect(guestUser.loginID).toBe("loginID")
  expect(guestUser.loginPass).toBe("password")
})


it('checkOnlineStatus(id)', async() => {
  let id = "some agent jid"
  let agentStatus = await rainbowShake.checkOnlineStatus(id);
  expect(agentStatus).toBe(true);
})


it('checkOfflineStatus(id)', async() => {
  let id = "some agent jid"
  let agentStatus = await rainbowShake.checkOfflineStatus(id);
  expect(agentStatus).toBe(false);
})


it('queryAgentStatus(agentEmail)', async() => {
  let agentEmail = "someEmail@email.com.sg"
  let data = await rainbowShake.queryAgentStatus(agentEmail);
  expect(data.loginEmail).toBe("someloginEmail");
})

it('getConversationDetails(convoID)', async() => {
  let convoID = "aklsdfbkaudisfblasd"
  let data = await rainbowShake.getConversationDetails(convoID);
  expect(data).toStrictEqual("this is a random convo")
})
