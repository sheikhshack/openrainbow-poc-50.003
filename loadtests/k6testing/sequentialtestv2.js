/**
 * The following will run API commands in order. This is what we use to emulate a queue. Each thread will sleep for
 * 5seconds
 */

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
    vus: 50,  // 1 user looping for 1 minute
    duration: '50s',

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


export function setup() {
    // first allocated a name to each VU
    let fname = faker.name.firstName();
    console.log(fname);
    let fsentence = faker.lorem.sentence();
    let res = http.get('https://localhost:3000/routing/createguestdynamic/?name=' + fname);


    let ticketNumber = res.json().ticketNumber;
    let bodySetup = JSON.stringify( {
        client: fname,
        department: "Rich Lad Office",
        communication: "Chat",
        problem: fsentence,
        queueDropped : false,
        ticketNumber: ticketNumber
    });

    let res2 = http.post('https://localhost:3000/routing/getRequiredCSA/', bodySetup, params);

    return { data: {ticketNumber: ticketNumber, queueStatus: res2.json().queueStatus, queueNumber: res2.json().queueNumber, jid: res2.json().jid } };
}

export default function(data) {

    if (data.queueStatus === "ready") {
        /**
         * enters sleep for 5000ms (simulate 1 message) then proceeds to terminate chat
         */
        let bodyEnd = JSON.stringify({
            clientEmail: faker.internet.email(),
            department: "Rich Lad Office",
            communication: "Chat",
            queueNumber: data.queueNumber,
            jid: data.jid,
            queueDropped: false,
            convoHistory: {
                "0": {"user": faker.lorem.sentence()},
                "1": {"user": faker.lorem.sentence()},
                "2": {"user": faker.lorem.sentence()},
                "3": {"agent": faker.lorem.sentence()},
            },
            ticketNumber: data.ticketNumber
        });

        sleep(5000);
        let resEnds = http.post('https://localhost:3000/routing/endChatInstance/', bodyEnd, params);
        sleep(500000);
    }


    let bodyRequest = JSON.stringify({
        department: "Rich Lad Office",
        communication: 'Chat',
        queueNumber: data.queueNumber
    });
    let initalFlag = 0;
    while (initalFlag === 0) {
        let res3 = http.post('https://localhost:3000/routing/getRequiredCSA/', bodyRequest, params);
        if (res3.json().queueStatus !== "ready") {
            initalFlag = 1;
            data.jid = res3.json().jid;
            sleep(500);
        }
    }

    let bodyEnder = JSON.stringify({
        clientEmail: faker.internet.email(),
        department: "Rich Lad Office",
        communication: "Chat",
        queueNumber: data.queueNumber,
        jid: data.jid,
        queueDropped: false,
        convoHistory: {
            "0": {"user": faker.lorem.sentence()},
            "1": {"user": faker.lorem.sentence()},
            "2": {"user": faker.lorem.sentence()},
            "3": {"agent": faker.lorem.sentence()},
        },
        ticketNumber: data.ticketNumber
    });

    sleep(5000);
    let resEnds = http.post('https://localhost:3000/routing/endChatInstance/', bodyEnder, params);
    console.log(JSON.stringify(resEnds.json()));
    sleep(50000);


}

export function teardown(data) {
    console.log(JSON.stringify(data));
}


