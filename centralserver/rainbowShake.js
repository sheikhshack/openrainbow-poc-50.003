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

function createGuests(talkTime) {
        rainbowSDK.admin.createAnonymousGuestUser(talkTime).then((guest) => {

            console.log("Guest has been created with login: " + guest.loginEmail + "and password : " + guest.password);
            return {
                "loginID": guest.loginEmail,
                "loginPass": guest.password
            };

        }).catch((err) => {
            console.log("OnError: ", err);
            return err;

        });


}

async function queryAgentStatus(agentEmail) {
       let data = await rainbowSDK.contacts.getContactByLoginEmail(agentEmail);
       console.log(data.presence);
       return data.presence;

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







