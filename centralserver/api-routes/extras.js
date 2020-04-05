/*
The following file describes all api endpoints pertaining to queue/routing mechanisms
 */
const rainbowMotherload = require('../rainbowShake');
const swaggyDatabase = require('../mongoclient');
const express = require('express');
const router = express.Router();

router.get('/createguestwithtoken', async (req, res) => {
    let token = await rainbowMotherload.createGuestWithTokenization();
    return res.send({
        token : token
    });
});

module.exports = router;
