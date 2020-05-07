// function postBooking
//const axios = require('axios');
//const https = require('https');
//const httpsAgent = new https.Agent({ rejectUnauthorized: false, keepAlive: true });
const sendPost = require('./sendPost');

function postBooking(req, res) {
    var carrid = req.body.conversation.memory['airline'].shortname;
    var connid = req.body.conversation.memory['connid'].raw;
    var name = req.body.conversation.memory['name'].fullname;
    var date = req.body.conversation.memory['date'].iso.replace("+00:00", "");

    var createDate = new Date(date);
    var flightDate = createDate.getTime() - createDate.getTime() % 86400000 + 86400000;

    sendPost(carrid, connid, flightDate, name);    
}

module.exports = postBooking;