// const NodeSDK = require("rainbow-node-sdk");
// var onlineStatus;
// const adminCredentials = require("./reference jsons/adminCredentials");
// const rainbowSDK = new NodeSDK(adminCredentials);
// rainbowSDK.start();

function init() {
    rainbowSDK.events.on('rainbow_onerror', function(err) {
        // do something when something goes wrong
        console.log("Connection to SANDBOX failed")
    });
}
async function createGuests(talkTime) {
        return {
          "loginID" : "some Login ID",
          "loginPass" : "some password"
        }
}

async function createGuestWithTokenization(){
    // this creates tokens for login instead. Front end can easily login with token
    let token = {
      "userdata" : "some user data",
      "application data" : "sameple application data",
      "token" : "token"
    }
    return token.token
}


async function createGuestWithName(name, ticketID){
    let result =
    {
      "firstname" : "firstName",
      "lastname"  : "lastName",
      "loginID" : "loginID",
      "password" : "password"
    }
    return {
      "loginID" : result.loginID,
      "loginPass" : result.password
    }
}

/*
Agent is online
*/
async function checkOnlineStatus(id){
    // uses the presence api
    let result = {
      "presence" : "online"
    }
    if (result.presence == "online"){
        return true;
    }
    return false;
}

/*
Agent is offline
*/
async function checkOfflineStatus(id){
    // uses the presence api
    let result = {
      "presence" : "offline"
    }

    if (result.presence == "online"){
        return true;
    }
    return false;
}


async function queryAgentStatus(agentEmail) {
    let data = {loginEmail : "someloginEmail"}
    return data;
}

async function getConversationDetails(convoID) {
    let convoData = "this is a random convo"
    return convoData;

}
  
module.exports = {
    init: init,
    queryAgentStatus:queryAgentStatus,
    getConversationDetails:getConversationDetails,
    createGuests:createGuests,
    createGuestWithName:createGuestWithName,
    createGuestWithTokenization: createGuestWithTokenization,
    checkOnlineStatus: checkOnlineStatus,
    checkOfflineStatus: checkOfflineStatus
    // overlord:rainbowSDK
};
