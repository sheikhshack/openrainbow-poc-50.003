/*
The following file describes all api endpoints pertaining to queue/routing mechanisms
 */
const rainbowMotherload = require('../rainbowShake');
const swaggyDatabase = require('../mongoclient');
const express = require('express');
const router = express.Router();

router.get('/superuserresetdatabase', async () => {
    console.log("reset initiated");
    await swaggyDatabase.reset();
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

module.exports = router;
