import http from 'k6/http';
import { check, group, sleep, fail } from 'k6';


export let options = {
    stages: [
        { duration: "1m", target: 40 } // simulate ramp-up of traffic from 1 to 100 users over 5 minutes.
        // { duration: "1m", target: 100 }, // stay at 50 users for 5 minutes
        // { duration: "1m", target: 0 }, // ramp-down to 0 users
    ],

    thresholds: {
        'http_req_duration': ['p(99)<3000'],
    },
    insecureSkipTLSVerify: true,
};

const url= 'https://localhost:3000/routing/checkQueueStatus/';
const USERNAME = 'Franky';
const body = JSON.stringify({
    department: "Rich Lad Office",
    communication: "Chat",
    queueNumber: 20
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
        'response is correct' : (res) => res.body.queueStatus !== null && res.body.queueNumber !== null
    });
    sleep(1);



}
