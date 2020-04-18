/*
The following file describes all api endpoints pertaining to queue/routing mechanisms
Error handling has been completed
 */
const rainbowMotherload = require('../rainbowShake');
const swaggyDatabase = require('../mongoclient');
const express = require('express');
const router = express.Router();

router.get('/superuserresetdatabase', async (req,res) => {
    console.log("reset initiated");
    await swaggyDatabase.reset();
    res.send({
        status: "Successful",
        message: "Hard Reset Completed. Simulated end of day protocol"
    })
});

router.get('/queryAdminContacts', async(req, res) => {
    let email = req.query.email;
    try{
        let listOfContacts = await rainbowMotherload.queryAgentStatus(email);
        let status = await rainbowMotherload.checkOnlineStatus(listOfContacts.jid);
        return res.send({
            listOfContacts
        });
    }
    catch (e) {
        return res.status(400).json({
            message: "User not reachable. May be of private status!"

        })
    }

});

router.post('/registerUserOnRainbow', async (req, res) => {
    let input = req.body;
    try{
        let result = await rainbowMotherload.registerNewCSAAgent(input.email, input.password, input.firstName, input.lastName);
        return res.send({
            jid: result.jid_im,
            status: "success on registration",
            loginID: input.email,
            loginPass: input.password
        })
    }
    catch (e) {
        return res.status(e.code).json({
            message: e.msg,
            messageDetails: e.error.errorDetails[0].msg
        })

    }

});

router.post('/terminateUserOnRainbow', async (req, res) => {
    let input = req.body;
    try{
        let result = await rainbowMotherload.terminateExistingCSAAgent(input.email);
        return res.send({
            status: "Successful",
            summary: result
        })
    }
    catch (e) {
        return res.status(400).json({
            message: "User does not exist!"

        })
    }

});

/**TODO: @Shake
 * These are for testing. Please remove when done
 *
 */
router.get('/retrieveBotPolicy', async (req, res) => {
    let result = await swaggyDatabase.retrieveBotPolicy();
    return res.send({
        status: "Successful",
        summary: result
    });
});

router.post('/getConvoDetails', async (req, res) => {
    let input = req.body;
    let result = await rainbowMotherload.getConversationDetails(input.id);
    return res.send({
        status: "Successful",
        summary: result
    });
});

router.get('/getTicketNumber', async (req, res) => {
    let result = await swaggyDatabase.getAndSetTicketNumber();
    return res.send({
        status: "Successful",
        summary: result
    });
});

router.get('/retrieve', async (req, res) => {
    let result = await rainbowMotherload.retriveListOfGuests();
    return res.send({
        status: "Successful",
        summary: result
    });
});

// WARNING!
// deletes all documents in the collection
router.post('/cleanUpSelectedCollection', async (req, res) => {
  let collection = req.body.collection;
  try {
    await swaggyDatabase.cleanUp(collection);
  } catch (e) {
    return res.status(400).json({
        message: "Failed to clean collection. Did you enter the right Collection Name?"
    })
  }
});

module.exports = router;
