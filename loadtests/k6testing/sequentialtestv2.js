/**
 * The following will run API commands in order. This is what we use to emulate a queue. Each thread will sleep for
 * 5seconds
 */

import http from 'k6/http';
import faker from 'cdnjs.com/libraries/Faker';

import { Rate, Trend } from 'k6/metrics';
import { check, group, sleep, fail } from 'k6';

// Constant chernenko
const BASE_URL = 'https://localhost:3000/';
const urls = {
    formSubmit: `${BASE_URL}routing/createguestdynamic/`,
    getReqCSA: `${BASE_URL}routing/getRequriedCSA/`,
    checkQueueStatus: `${BASE_URL}routing/checkQueueStatus/`,
    endChat: `${BASE_URL}routing/endChatInstance/`
};

let params = {
    headers: {
        'Content-Type': 'application/json',
    }
};
// Fail rates reporter

const firstFailRate = new Rate('failed API response for (1)');
const secondFailRate = new Rate('failed API response for (2)');
const thirdFailRate = new Rate('failed API response for (3)');
const fourthFailRate = new Rate('failed API response for (4)');

// Trendlines

var queueFetchTimings = new Trend('Queue Wait Timing (Under Load)');
var successfulSequence = new Rate('Successful Completion of an Instance (Under Load)');

export let options = {
    stages: [
        { duration: '10s', target: 10 },
        { duration: '50s', target: 30 },
        { duration: '50s', target: 60 },
        { duration: '1m', target: 0 },
    ],
    thresholds: {

        // 'failed API response for (1)': ['rate<0.1'],
        // 'failed API response for (2)': ['rate<0.1'],
        // 'failed API response for (3)': ['rate<0.1'],
        'Successful Completion of an Instance (Under Load)': ['rate>0.8'],
        'http_req_duration': ['p(95)<4000']

    },
    insecureSkipTLSVerify: true,
};

// VU is like a thread/user



export default function() {
    let initalFlag = false;
    let fname = faker.name.firstName();
    let fsentence = faker.lorem.sentence();
    let fmail = faker.internet.email();
    let res = http.get('https://localhost:3000/routing/createguestdynamic/?name=' + fname);
    check(res,{
        "response code is correct for Create Guest": (res) => res.status ==200,
        "http packet is valid and correct sizes":(res) => res.body.length > 0,
        "Valid JID provided for authentication":(res) => res.json().guestID != null

    });


    let ticketNumber = res.json().ticketNumber;
    let bodySetup = JSON.stringify( {
        client: fname,
        department: "Rich Lad Office",
        communication: "Chat",
        problem: fsentence,
        queueDropped : false,
        email: fmail,
        ticketNumber: ticketNumber
    });

    let res2 = http.post('https://localhost:3000/routing/getRequiredCSA/', bodySetup, params);
    check(res2,{
        "response code is correct for getRequiredCSA": (res2) => res2.status == 200,
        "response parameters is correct for getRequiredCSA":(res2) => res2.json().queueStatus != null,
        "http packet is valid and correct sizes":(res2) => res2.body.length > 0

    });

    console.log(JSON.stringify(res2.json()));
    sleep(1);



    if (res2.json().queueStatus == "ready") {
        /**
         * enters sleep for 5000ms (simulate 1 message) then proceeds to terminate chat
         */
        sleep(15);
        let bodyEnd = JSON.stringify({
            clientEmail: faker.internet.email(),
            department: "Rich Lad Office",
            communication: "Chat",
            queueNumber: res2.json().queueNumber,
            jid: res2.json().jid,
            queueDropped: false,
            convoHistory: {
                "0":{"user":"I got a big big problem"},
                "1":{"user":"I got a big big problem I got a big big problem I got a big big problem I got a big big problem I got a big big problem I got a big big problem"},
                "2":{"user":"I got a big big problemI got a big big problemI got a big big problemI got a big big problemI got a big big problemI got a big big problemI got a big big problem"},
                "3":{"agent":"I got a big big solution"},
                "4":{"agent":"I got a big big solution"},
                "5":{"agent":"I got a big big solution"},
                "6":{"agent":"I got a big big solution"},
                "7":{"user":"hello"}
            },
            ticketNumber: res.json().ticketNumber
        });

        let resEnds = http.post('https://localhost:3000/routing/endChatInstance/', bodyEnd, params);
        check(resEnds,{
            "response code is correct for endChatInstance (premature)": (res2) => res2.status != null,
            "response parameters is correct for endChatInstance (premature)": (res2) => res2.body.length > 0
        });
        successfulSequence.add(1);
        sleep(5000);
        console.log("Successful Ending");
    }
    if (res2.json().queueStatus === "enqueued"){
        let bodyRequest = JSON.stringify({
            department: "Rich Lad Office",
            communication: 'Chat',
            queueNumber: res2.json().queueNumber
        });

        let jidRetrieved;
        let queueNumberRetrieved;
        while (!initalFlag) {
            let res3 = http.post('https://localhost:3000/routing/checkQueueStatus/', bodyRequest, params);
            queueFetchTimings.add(res3.timings.waiting);

            if (res3.json().queueStatus === "ready") {
                initalFlag = true;
                jidRetrieved = res3.json().jid;
                queueNumberRetrieved = res3.json().queueNumber;
                console.log(JSON.stringify(res3.json()));
                sleep(2);
            }
        }
        let bodyEnder = JSON.stringify({
            clientEmail: faker.internet.email(),
            department: "Rich Lad Office",
            communication: "Chat",
            queueNumber: queueNumberRetrieved,
            jid: jidRetrieved,
            queueDropped: false,
            convoHistory: {
                "0": {"user": faker.lorem.sentence()},
                "1": {"user": faker.lorem.sentence()},
                "2": {"user": faker.lorem.sentence()},
                "3": {"agent": faker.lorem.sentence()},
            },
            ticketNumber: res.json().ticketNumber
        });

        let resEnds1 = http.post('https://localhost:3000/routing/endChatInstance/', bodyEnder, params);
        successfulSequence.add(1);
        check(resEnds1,{
            "response code is correct for endChatInstance": (resEnds1) => resEnds1.status != null,
            "response parameters is correct for endChatInstance ": (resEnds1) => resEnds1.body.length > 0
        });
        sleep(5000);
    }



}



