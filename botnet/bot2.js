const ChatBot = require("rainbow-chatbot");
const NodeSDK = require("rainbow-node-sdk");

// Load the bot identity
const bot = require("./bot2.json");

// Load the scenario
const scenario = require("./scenario2.json");
let chatbot = null;
let nodeSDK = null;

// Start the SDK
nodeSDK = new NodeSDK(bot);
nodeSDK.start().then( () => {
    // Start the bot

     chatbot = new ChatBot(nodeSDK, scenario);
    return chatbot.start();
}).then( () => {
    // Do something once the chatbot has been started

    chatbot.onMessage((tag, step, content, from, done) => {
        // Do something when an answer is handled by the bot (i.e. change the route)
        console.log("::: On answer:>", tag, step, content, from);

        if (tag === "tag" && step === "aQuestion" && content === "yes")
        {
            done('aQuestion');
        }

        else
        {
            done();
        }
    }, this);

    chatbot.onTicket((tag, history, from, start, end, state, id) => {
        //

    }, this);

});