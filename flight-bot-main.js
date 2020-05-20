// flight-bot main method
// load dependencies
const express = require('express');
const bodyParser = require('body-parser');

const getFlightTime = require('./getFlightTime');
const getFlights = require('./getFlights');
const getFlightDates = require('./getFlightDates');
const findConnid = require('./findConnid');
const checkFlightData = require('./checkFlightData');
const postBooking = require('./postBooking');
const confirmBooking = require('./confirmBooking');
const showAllFlights = require('./showAllFlights');
const memoryUpdateCities = require('./memoryUpdateCities');

const app = express();
app.use(bodyParser.json());

// load routes
app.post('/get-flight-time', getFlightTime);
app.post('/get-flights', getFlights);
app.post('/get-flight-dates', getFlightDates);
app.post('/find-connid', findConnid);
app.post('/check-flight-data', checkFlightData);
app.post('/post-booking', postBooking);
app.post('/confirm-booking', confirmBooking);
app.post('/show-all-flights', showAllFlights);
app.post('/memory-update-cities', memoryUpdateCities);

app.post('/errors', function (req, res) {
    console.error(req.body);
    res.sendStatus(200);
});

// start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`App is listening on port ${PORT}`));