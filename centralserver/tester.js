// this is a testbed to understand the node SDK better. Commented are some functions wherever necessary

const NodeSDK = require("rainbow-node-sdk");
const adminCredentials = require("./adminCredentials");

let rainbowSDK = new NodeSDK(adminCredentials);

rainbowSDK.start();

rainbowSDK.events.on('rainbow_onready', function() {
    // do something when the SDK is connected to Rainbow

    // this function should cause a creation of anonymous user
    let talkTime = 3600;
    rainbowSDK.admin.createAnonymousGuestUser(talkTime).then((guest) => {
        // prints the created guest's credentials, refer to sampleguest.json for full specs
            // guest.loginEmail;
            // guest.companyId;
            // guest.jid_im;
            // guest.jid_tel;
            // guest.jid_password;
            // guest.password;
        console.log("Guest has been created with login: " + guest.loginEmail + "and password : " + guest.password);


    }).catch((err) => {
        console.log("OnError: ", err);

    });

    // this function queries for the user available on SDK (looks for friggin albert)
    // various ways to query for contact, but  this is the easiest
    rainbowSDK.contacts.getContactByLoginEmail("bot1@swaggy.com").then((queriedUser) => {
        if(queriedUser) {
            // Do something with the contacts found
            // console.log(queriedUser);
            console.log("User " + queriedUser.name.value + " is currently " + queriedUser.presence);

        }
        else {
            console.log("User " + queriedUser + " not found");

        }
    }).catch((err) => {
        // Do something in case of failure
        console.log(err);

    });




});


rainbowSDK.events.on('rainbow_onerror', function(err) {
    // do something when something goes wrong
    console.log("Connection to SANDBOX failed")
});

// creation of temporary users (for the client)

