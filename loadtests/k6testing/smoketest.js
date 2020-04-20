/**
 * The following is a simulated testing happening in real-time
 * Please do not abuse this script. Only for simulated testing
 *
 */
import http from 'k6/http';
import { sleep } from 'k6';
import { Rate } from 'k6/metrics';
import { check, group, sleep, fail } from 'k6';

// Constant chernenko
const BASE_URL = 'https://localhost:3000/';
const urls = {
    formSubmit: `${BASE_URL}routing/createguestdynamic`,
    getReqCSA: `${BASE_URL}routing/getRequriedCSA/`,
    checkQueueStatus: `${BASE_URL}routing/checkQueueStatus/`,
    endChat: `${BASE_URL}routing/endChatInstance/`
};

// Fail rates reporter

const firstFailRate = new Rate('failed API response for (1)');
const secondFailRate = new Rate('failed API response for (2)');
const thirdFailRate = new Rate('failed API response for (3)');
const fourthFailRate = new Rate('failed API response for (4)');

export let options = {
    vus: 1,  // 1 user looping for 1 minute
    duration: '1m',

    thresholds: {
        thresholds: {
            'failed API response for (1)': ['rate<0.1'],
            'failed API response for (2)': ['rate<0.1'],
            'failed API response for (3)': ['rate<0.1'],
            'failed API response for (4)': ['rate<0.1'],
            'http_req_duration': ['p(95)<4000']
        }
    },
    insecureSkipTLSVerify: true,
};



const simulateFormSubmission = (USERNAME) => {
    const formSubmissionResult = http.get(urls.formSubmit, {
        name: USERNAME,
    });
    firstFailRate.add(formSubmissionResult.status!== 200);

};
const simulateGetRequiredCSA = () => {
    const getRequiredCSA = http.post(urls.getReqCSA, payload, headers);
    secondFailRate.add(getRequiredCSA.status!== 200);

};

const simulateCheckQueueStatus = () => {
    const getRequiredCSA = http.post(urls.checkQueueStatus, payload, headers);
    thirdFailRate.add(getRequiredCSA.status!== 200);

};

const simulateEndChat = () => {
    const getRequiredCSA = http.post(urls.endChat, payload, headers);
    fourthFailRate.add(getRequiredCSA.status!== 200);

};



