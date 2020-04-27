import http from 'k6/http';
import { check, group, sleep, fail } from 'k6';


export let options = {
    stages: [
        { duration: "1m", target: 200 }, // simulate ramp-up of traffic from 1 to 100 users over 5 minutes.
        { duration: "1m", target: 200 }, // stay at 50 users for 5 minutes
        { duration: "1m", target: 0 }, // ramp-down to 0 users
    ],

    thresholds: {
        requests: ['count < 200'],
    },
    insecureSkipTLSVerify: true,
};

const url= 'https://localhost:3000/routing/getRequiredCSA/';
const USERNAME = 'Franky';
const body = JSON.stringify({
    client: "Goliath Engine Test",
    department: "Rich Lad Office",
    communication: "Chat",
    problem: "k6 testing Please Ignore",
    queueDropped : false,
    ticketNumber: 3000
});


let params = {
    headers: {
        'Content-Type': 'application/json',
    }

};

export default () => {
    let res = http.post(url, body, params);
    const checkRes = check(res, {
        'status is 200': (res) => res.status === 200
    });





}
