// function postBooking
const axios = require('axios');
const https = require('https');
const httpsAgent = new https.Agent({ rejectUnauthorized: false, keepAlive: true });

function sendPost(carrid,connid,flightDate,name) {
    const BASE_URL = "https://sapdemo-s4.exxcellent.de:8001/sap/opu/odata/sap/ZTRAVEL_SRV";
    const BASE_URL_POST = "https://sapdemo-s4.exxcellent.de:8001/sap/opu/odata/sap/ZTRAVEL_SRV/ZBC_C_Booking_TP"
    const axiosInstance = axios.create({ baseURL: BASE_URL });

    var token = "";

    const createSession = async () => {
        const authParams = {
            params: {
                'sap-user': 'skr',
                'sap-password': 'exxcellent123',
                'sap-client': '100'
            },
            withCredentials: true,
            headers: { 'x-csrf-token': 'fetch' },
            httpsAgent: httpsAgent,
            auth: {
                username: 'skr',
                password: 'exxcellent123'
            }
        };

        const resp = axiosInstance.get(BASE_URL, authParams).then(res => {
            token = res.headers['x-csrf-token'];            
            const cookie = res.headers["set-cookie"][0]; // get cookie from request
            axiosInstance.defaults.headers.Cookie = res.headers["set-cookie"][0]+";"+ res.headers["set-cookie"][1]+";"+res.headers["set-cookie"][2];

            const jsonBodyStr = {
            "Carrid": carrid,
            "Connid": connid,
            "Fldate": "/Date("+flightDate+")/",
            "Cancelled": "",
            "Counter": "00000001",
            "Passname": name,
            "Reserved": "",
            "Customid": "00000666",
            "Class": "Y"
        };
            var config = {
                headers: {
                    'x-csrf-token': token, 'dataType': 'json', 'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                httpsAgent: httpsAgent,
                withCredentials: true
            };

            var y = "/ZBC_C_Booking_TP?sap-user=skr&sap-password=exxcellent123&sap-client=100";
            axiosInstance.post(y, jsonBodyStr, config).then(res => {

            }).catch(err => {

            });

        }).catch(err => {
            res.json({
                replies: [
                    {
                        type: 'text', content: `Something must have gone wrong. Please try to explain your matter once again.`
                    },
                ],
            });
        });
    };

    createSession().then(() => {

    });
}

module.exports = sendPost;