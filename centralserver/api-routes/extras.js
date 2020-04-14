/*
The following file describes all api endpoints pertaining to queue/routing mechanisms
Error handling has been completed
 */
const rainbowMotherload = require('../rainbowShake');
const swaggyDatabase = require('../mongoclient');
const express = require('express');
const router = express.Router();

router.get('/createguestwithtoken', async (req, res) => {
    try{
        let token = await rainbowMotherload.createGuestWithTokenization();
        return res.send({
            token : token
        });
    }
    catch (e) {
        return res.status(400).json({
            message: "Spam protection has been triggered. Please turn off your hacks"

        })
    }

});

module.exports = router;
