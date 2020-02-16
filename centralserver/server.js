
let rainbowMotherload = require('./rainbowShake');

rainbowMotherload.overlord.events.on('rainbow_onready',async function(){
    // let loginCreds = rainbowMotherload.createGuests(3600).then();
    // console.log(loginCreds);
    // console.log("Success! Module exported with id " + loginCreds.loginID);

    let querystatus = await rainbowMotherload.queryAgentStatus("bot1@swaggy.com");
    console.log("Success! Bot info retrieved with status " + querystatus);
});
