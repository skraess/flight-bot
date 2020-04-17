// function getData
// loads data from external webservice
const axios = require('axios');
const https = require('https');
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

function getData(URL) {
    return axios.get(URL, { httpsAgent }).then(response => {
        return response.data
    }).catch(err => {
    });
}

module.exports = getData;