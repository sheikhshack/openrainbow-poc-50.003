// Load the SDK
let RainbowSDK = require('rainbow-node-sdk');


// Define your configuration
let options = {
    "rainbow": {
        "host": "sandbox",
    },
    "credentials": {
        "login": "sheikhsalim@mymail.sutd.edu.sg",
        "password": "@Swaggy97"
    },
    // Application identifier
    "application": {
        "appID": "619bb6404b6b11ea819a43cb4a9dae9b",
        "appSecret": "x2nw9mfYuvFjWRX5AspjFXPrlWwdblDTco3Wqls3nKDzNQESJHNIa09XeF1kkOwP",
    },
    // Logs options
    "logs": {
        "enableConsoleLogs": true,
        "enableFileLogs": false,
        "file": {
            "path": '/var/tmp/rainbowsdk/',
            "level": 'debug'
        }
    },
    // IM options
    "im": {
        "sendReadReceipt": false, // If it is setted to true (default value), the 'read' receipt is sent automatically to the sender when the message is received so that the sender knows that the message as been read.
        "messageMaxLength": 1024, // the maximum size of IM messages sent. Note that this value must be under 1024.
        "sendMessageToConnectedUser": false, // When it is setted to false it forbid to send message to the connected user. This avoid a bot to auto send messages.
        "conversationsRetrievedFormat": "small", // It allows to set the quantity of datas retrieved when SDK get conversations from server. Value can be "small" of "full"
        "storeMessages": false, // Define a server side behaviour with the messages sent. When true, the messages are stored, else messages are only available on the fly. They can not be retrieved later.
        "nbMaxConversations": 15, // parameter to set the maximum number of conversations to keep (defaut value to 15). Old ones are removed from XMPP server. They are not destroyed. The can be activated again with a send to the conversation again.
        "rateLimitPerHour": 1000 // Set the maximum count of stanza messages of type `message` sent during one hour. The counter is started at startup, and reseted every hour. 
    },

    // Services to start. This allows to start the SDK with restricted number of services, so there are less call to API.
    // Take care, severals services are linked, so disabling a service can disturb an other one.
    // By default all the services are started. Events received from server are not filtered.
    // So this feature is realy risky, and should be used with much more cautions.
    servicesToStart: {
        bubbles: {
            start_up: true,
        }, //need services : 
        telephony: {
            start_up: true,
        }, //need services : _contacts, _bubbles, _profiles
        channels: {
            start_up: true,
        }, //need services :  
        admin: {
            start_up: true,
        }, //need services :  
        fileServer: {
            start_up: true,
        }, //need services : _fileStorage
        fileStorage: {
            start_up: true,
        }, //need services : _fileServer, _conversations
        calllog: {
            start_up: true,
        }, //need services :  _contacts, _profiles, _telephony
        favorites: {
            start_up: true,
        } //need services :  
    } // */

};

// Instantiate the SDK
let rainbowSDK = new RainbowSDK(options);

rainbowSDK.events.on('rainbow_onstarted', () => {
    // Do something when the SDK has been started
    console.log("RainbowSDK: started");
});

rainbowSDK.events.on('rainbow_onconnected', () => {
    // Do something when the SDK has successfully connected to Rainbow
    console.log("RainbowSDK: connected");
});

rainbowSDK.events.on('rainbow_onready', () => {
    // Do something when the SDK is ready to be used
    console.log("RainbowSDK: ready");
    let bubbles = rainbowSDK.bubbles.getAll();

});



// Start the SDK
rainbowSDK.start().then(() => {
    // Do something when the SDK is connected to Rainbow


    /**
     * ***************************************************************************************************************
     * Handle "is_typing" Feature  ***********************************************************************************
     * ***************************************************************************************************************
     * */

    // Get the conversations
    let result = rainbowSDK.conversations.getConversations();
    console.log(result);
    let result_bubble = rainbowSDK.bubbles.getAllActiveBubbles();

    // Select the first one 
    let conversation = result[0];
    // Check it is a one to one conversation
    if (conversation.type === Conversation.Type.ONE_TO_ONE) {
        // Send the typing state to true 
        rainbowSDK.im.sendIsTypingStateInConversation(conversation, true);
    }

    if (result.length > 0) {
        // Select the first one
        let bubble = result_bubble[0];
        // Send the typing state to true
        that.rainbowSDK.im.sendIsTypingStateInBubble(bubble, true);
    }



    /**
    * ***************************************************************************************************************
    * Handle Recieved Messages  *************************************************************************************
    * ***************************************************************************************************************
    * */
    rainbowSDK.events.on('rainbow_onmessagereceived', (message) => {
        // if the message is event based (admin message/alarm message), notify the admin who has received
        if (message.isEvent) {
            rainbowSDK.im.markMessageAsRead(message);
        }
        
        
        // Check if the message is not from you
        if (!message.fromJid.includes(rainbowSDK.connectedUser.jid_im)) {
            // Check that the message is from a user and not a bot
            // User message Handler 
            if (message.type === "chat") {
                // Sender ID && Message contents 
                console.log("Sender ID: " + message.fromJid);
                console.log("Message Content: " + message.content); 
                // Answer to this user 
                rainbowSDK.im.sendMessageToJid("hello! How may I help you?", message.fromJid);
                // replying to the specific recipient 
                rainbowSDK.im.sendMessageToJidAnswer("hello! How may I help you?", message.fromJid, 'FR', null, 'subject', message);

                
            }

            // Bublle Message Handler 
            if (message.type === "groupchat") {
                // Answer to this user
                let messageSent = rainbowSDK.im.sendMessageToBubbleJid("I got it!", message.fromBubbleJid);
                // reply to a specific message to a bubble 
                let messageSent_reply = rainbowSDK.im.sendMessageToBubbleJidAnswer("I got it!", message.fromBubbleJid, "FR", null, 'subject', message);
            }
        }

    });

    /**
     * ***************************************************************************************************************
     * Receipt Handling  *********************************************************************************************
     * ***************************************************************************************************************
     * */

    /**
     * Listening to server receipts
     **/
    rainbowSDK.events.on('rainbow_onmessageserverreceiptreceived', (receipt) => {
    // do something when the message has been received by the Rainbow server
    
    });


    /**
     * Then, when the recipient receives the message, the following receipt is sent to you:
     * */
    rainbowSDK.events.on('rainbow_onmessagereceiptreceived', (receipt) => {
    // do something when the message has been received by the recipient
    
    });

    /**
     * Finally, when the recipient reads the message, the following receipt is sent to you
     * */
    rainbowSDK.events.on('rainbow_onmessagereceiptreadreceived', function (receipt) {
    // do something when the message has been read by the recipient
    
    });

}).catch((err) => {
    console.log(err);

});
