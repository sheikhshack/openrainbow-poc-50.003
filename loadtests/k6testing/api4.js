import http from 'k6/http';
import { check, group, sleep, fail } from 'k6';


export let options = {
    stages: [
        { duration: "1m", target: 20 } // simulate ramp-up of traffic from 1 to 100 users over 5 minutes.
        // { duration: "1m", target: 100 }, // stay at 50 users for 5 minutes
        // { duration: "1m", target: 0 }, // ramp-down to 0 users
    ],

    thresholds: {
        'http_req_duration': ['p(99)<3000'],
    },
    insecureSkipTLSVerify: true,
};

const url= 'https://localhost:3000/routing/endChatInstance/';
const USERNAME = 'Franky';
const body = JSON.stringify({
    "clientEmail" : "tinkit@ioa.com",
    "department":"Graduate Office",
    "communication":"Chat",
    "queueNumber":"4",
    "jid" : "77d67a7492964a719a82718c76ba49a4@sandbox-all-in-one-rbx-prod-1.rainbow.sbg",
    "convoID" : "someconvoID",
    "queueDropped" : false,
    "convoHistory" : {
        "0":{"user":"I got a big big problem"},
        "1":{"user":"I got a big big problem I got a big big problem I got a big big problem I got a big big problem I got a big big problem I got a big big problem"},
        "2":{"user":"I got a big big problemI got a big big problemI got a big big problemI got a big big problemI got a big big problemI got a big big problemI got a big big problem"},
        "3":{"agent":"I got a big big solution"},
        "4":{"agent":"I got a big big solution"},
        "5":{"agent":"I got a big big solution"},
        "6":{"agent":"I got a big big solution"},
        "7":{"user":"hello"}
    },
    "ticketNumber" : 3000

});


let params = {
    headers: {
        'Content-Type': 'application/json',
    }

};

export default () => {
    let res = http.post(url, body, params);
    check(res, {
        'status is 200': (res) => res.status === 200,
        'response is correct' : (res) => res.body.status !== null
    });
    sleep(1);



}
