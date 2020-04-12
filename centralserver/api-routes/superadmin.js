/*
The following file describes all api endpoints pertaining to queue/routing mechanisms
 */
const rainbowMotherload = require('../rainbowShake');
const swaggyDatabase = require('../mongoclient');
const express = require('express');
const router = express.Router();

router.get('/superuserresetdatabase', async (req,res) => {
    console.log("reset initiated");
    await swaggyDatabase.reset();
    res.send('Hard Reset Completed!')
});

router.get('/queryAdminContacts', async(req, res) => {
    let email = req.query.email;
    let listOfContacts = await rainbowMotherload.queryAgentStatus(email);
    let status = await rainbowMotherload.checkOnlineStatus(listOfContacts.jid);
    console.log(status);
    return res.send({
        listOfContacts
    });
});

router.post('/registerUserOnRainbow', async (req, res) => {
    let input = req.body;
    let result = await rainbowMotherload.registerNewCSAAgent(input.email, input.password, input.firstName, input.lastName);
    return res.send({
        jid: result.jid_im,
        status: "success on registration",
        loginID: input.email,
        loginPass: input.password
    })
});

router.post('/terminateUserOnRainbow', async (req, res) => {
    let input = req.body;
    let result = await rainbowMotherload.terminateExistingCSAAgent(input.email);
    return res.send({
        status: "Successful",
        summary: result
    })
});
module.exports = router;
