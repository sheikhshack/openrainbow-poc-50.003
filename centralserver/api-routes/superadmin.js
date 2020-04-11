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
    return res.send('Hard Reset achieved!')
});

router.get('/queryAdminContacts', async(req, res) => {
    let email = req.body.email;
    let listOfContacts = await rainbowMotherload.queryAgentStatus(email);
    let status = await rainbowMotherload.checkOnlineStatus(listOfContacts.jid);
    console.log(status);
    return res.send({
        listOfContacts
    });
});

module.exports = router;
