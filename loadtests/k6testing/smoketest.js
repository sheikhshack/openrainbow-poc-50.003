import http from 'k6/http';
import { check, group, sleep, fail } from 'k6';


export let options = {
    vus: 1,  // 1 user looping for 1 minute
    duration: '1m',

    thresholds: {
        'http_req_duration': ['p(99)<1800'], // 99% of requests must complete below 1.5s
    },
    insecureSkipTLSVerify: true,
};

const BASE_URL = 'https://localhost:3000/';
const USERNAME = 'Franky';

export default () => {
    let loginRes = http.get(`${BASE_URL}routing/createguestdynamic`, {
        name: USERNAME,

    });

    check(loginRes, { 'created account successfully': (resp) => resp.json('guestID') !== null });



    sleep(1);
}
