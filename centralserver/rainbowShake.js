// this is a mother of all modules kind of setup

// initialises the module
const NodeSDK = require("rainbow-node-sdk");
var onlineStatus;
const adminCredentials = require("./adminCredentials");
const rainbowSDK = new NodeSDK(adminCredentials);
rainbowSDK.start();


function init() {

    rainbowSDK.events.on('rainbow_onerror', function(err) {
        // do something when something goes wrong
        console.log("Connection to SANDBOX failed")
    });
}

async function createGuests(talkTime) {
        // I simplified the process with async-await because i lazy type
        let result = await rainbowSDK.admin.createAnonymousGuestUser(talkTime);

        // emulates sending of first text
        // await rainbowSDK.im.sendMessageToJid("Hey there. I am CSA Sheikh here", result.jid);
        // due to shit APIS, forced to create bubble instead
        // rainbowSDK.bubbles.createBubble("Test", "A testing mechanism", false).then(function(bubble) {
        //     rainbowSDK.bubbles.inviteContactToBubble(result, bubble, false, false, "non");
        //
        // }).catch((err) =>
        // {
        //
        // });

        return {
            "loginID" : result.loginEmail,
            "loginPass" : result.password
        }


        // rainbowSDK.admin.createAnonymousGuestUser(talkTime).then((guest) => {
        //
        //     console.log("Guest has been created with login: " + guest.loginEmail + "and password : " + guest.password);
        //     return {
        //         "loginID": guest.loginEmail,
        //         "loginPass": guest.password
        //     };
        //
        // }).catch((err) => {
        //     console.log("OnError: ", err);
        //     return err;
        //
        // });


}

async function queryAgentStatus(agentEmail) {
       //let data = await rainbowSDK.contacts.getContactByLoginEmail(agentEmail);
       let data2 = await rainbowSDK.contacts.getRosters();
       return data2

        // rainbowSDK.contacts.getContactByLoginEmail(agentEmail).then((queriedUser) => {
        //     if (queriedUser) {
        //
        //         console.log("User " + queriedUser.name.value + " is currently " + queriedUser.presence);
        //         return queriedUser.presence;
        //
        //     } else {
        //         console.log("User " + queriedUser + " not found");
        //         return null;
        //
        //     }
        // }).catch((err) => {
        //     // Do something in case of failure
        //     console.log(err);
        //     return err;
        //
        // });

}
module.exports = {
    init: init,
    queryAgentStatus:queryAgentStatus,
    createGuests:createGuests,
    overlord:rainbowSDK
};







