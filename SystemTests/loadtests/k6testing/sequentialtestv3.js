
import http from 'k6/http';
import faker from 'cdnjs.com/libraries/Faker';

import { Rate } from 'k6/metrics';
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

export let options = {
    stages: [
        { duration: '10s', target: 4 },
        { duration: '50s', target: 4 },
        { duration: '2m', target: 4 },
        { duration: '1m', target: 0 },
    ],
    thresholds: {

        // 'failed API response for (1)': ['rate<0.1'],
        // 'failed API response for (2)': ['rate<0.1'],
        // 'failed API response for (3)': ['rate<0.1'],
        // 'failed API response for (4)': ['rate<0.1'],
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



    if (res2.json().queueStatus === "ready") {
        /**
         * enters sleep for 5000ms (simulate 1 message) then proceeds to terminate chat
         */
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
        console.log(JSON.stringify(resEnds));
        sleep(500000);
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
            sleep(1000);
            console.log(JSON.stringify(res3.json()));
            if (res3.json().queueStatus === "ready") {
                initalFlag = true;
                jidRetrieved = res3.json().jid;
                queueNumberRetrieved = res3.json().queueNumber;
                console.log(JSON.stringify(res3.json()));
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

        sleep(5000);
        let resEnds = http.post('https://localhost:3000/routing/endChatInstance/', bodyEnder, params);
        console.log(JSON.stringify(resEnds.json()));
        sleep(50000);
    }



}
