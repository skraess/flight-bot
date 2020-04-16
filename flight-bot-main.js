// flight-bot main method
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const https = require('https');
const getFlightTime = require('./getFlightTime');

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const app = express();
app.use(bodyParser.json());

// Load routes
app.post('/get-flight-time', getFlightTime.getFlightTime);
app.post('/get-flights', getFlights);
app.post('/get-flight-dates', getFlightDates);
app.post('/find-connid', findConnid);
app.post('/errors', function (req, res) {
    console.error(req.body);
    res.sendStatus(200);
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`App is listening on port ${PORT}`));

// function getFlightDates
function getFlightTime(req, res) {
    const airline = req.body.conversation.memory['airline'].shortname;
    const connid = req.body.conversation.memory['connid'].raw;
    const date = req.body.conversation.memory['date'].iso.replace("+00:00", "");

    const URL = "https://sapdemo-s4.exxcellent.de:8001/sap/opu/odata/sap/ZTRAVEL_SRV/ZBC_C_Flight_TP(Carrid=%27" + airline + "%27,Connid=%27" + connid + "%27,Fldate=datetime%27" + date + "%27)/to_Connection/?$format=json&sap-client=100&sap-user=skr&sap-password=exxcellent123";

    axiosTest(URL);
    axiosTest(URL).then(data => {
        // Get departure time
        const deptime = data.d.Deptime.replace("PT", "").replace("00S", "");
        const arrtime = data.d.Arrtime.replace("PT", "").replace("00S", "");

        res.json({
            replies: [
                {
                    type: 'text', content: `Your flight will leave ${data.d.Cityfrom}(${data.d.Airpfrom}) at ${deptime} and will land in ${data.d.Cityto}(${data.d.Airpto}) at ${arrtime}.`
                },
            ],
        });
    }).catch(err => {
        res.json({
            replies: [
                {
                    type: 'text', content: `I'm sorry but I didn't find any flight with your criteria.`
                },
            ],
        });
    });
};

// function getFlights
function getFlights(req, res) {
    const depcity = req.body.conversation.memory['depcity'].value;
    const arrcity = req.body.conversation.memory['arrcity'].value;

    var URL = "https://sapdemo-s4.exxcellent.de:8001/sap/opu/odata/sap/ZTRAVEL_SRV/ZBC_C_Connection_TP/?$format=json&sap-client=100&sap-user=skr&sap-password=exxcellent123";

    /*if (req.body.conversation.memory['date'] != null) {
        const date = req.body.conversation.memory['date'].iso.replace("+00:00", "");
    }*/
    if (req.body.conversation.memory['airline'] != null) { // search only in data of entered airline
        const airline = req.body.conversation.memory['airline'].shortname;
        URL = "https://sapdemo-s4.exxcellent.de:8001/sap/opu/odata/sap/ZTRAVEL_SRV/ZBC_C_Carrier_TP%28%27"+airline+"%27%29/to_Connection/?$format=json&sap-client=100&sap-user=skr&sap-password=exxcellent123";
    }

    axiosTest(URL);
    axiosTest(URL).then(data => {
        // Find flight indices with right depcity and arrcity
        var dataCopy = data.d.results.slice(); // get copy of data able to be manipulated
        flightIndex = findIndicesOfConnection(dataCopy, depcity, arrcity);        

        var ret = "";
        var flightsSaved = [];
        var button = [];
        var flight;

        for (var i = 0; i < flightIndex.length; i++) {
            flight = data.d.results[flightIndex[i]];
            ret += `\n\nNo. ${i+1}:\nCarrier: ${flight.Carrid} \nConnid: ${flight.Connid} \nFrom: ${flight.Cityfrom} (${flight.Airpfrom}) \nTo: ${flight.Cityto} (${flight.Airpto}) \nDeparture: ${flight.Deptime.replace("PT", "").replace("00S", "")} \nArrival: ${flight.Arrtime.replace("PT", "").replace("00S", "")}`;
            flightsSaved.push(flight);
            button.push({ title: "Yes, for No. " + (i + 1), value: "Yes, for number " + (i + 1) + "." });
        }
        button.push({ title: 'No, thank you.', value: 'No.' });

        if (flightIndex.length === 0) { // No flights found
            res.json({
                replies: [
                    {
                        type: 'text', content: `I'm sorry but I didn't find any flights from ${depcity} to ${arrcity}.\n`
                    },
                ],
            });
        } else {
            res.json({
                replies: [
                    {
                        type: 'text', content: `Here are all flights that I found for you:${ret}`,
                    },
                    {
                        type: 'quickReplies',
                        content: {
                            title: 'Do you want to see possible flight dates of one of these flights?',
                            buttons: button,
                        },
                    },
                ],
                conversation: {
                    memory: {
                        flights: flightsSaved,
                    }
                }
            });
        }        
    })
};

function getFlightDates(req, res) {
    // Get flight dates of a specific Connid
    const searchid = req.body.conversation.memory['searchid'].scalar-1;
    const carrid = req.body.conversation.memory.flights[searchid].Carrid;
    const connid = req.body.conversation.memory.flights[searchid].Connid;

    const URL = "https://sapdemo-s4.exxcellent.de:8001/sap/opu/odata/sap/ZTRAVEL_SRV/ZBC_C_Carrier_TP%28%27" + carrid + "%27%29/to_Flight/?$format=json&sap-client=100&sap-user=skr&sap-password=exxcellent123";

    axiosTest(URL);
    axiosTest(URL).then(data => {
        var dataCopy = data.d.results.slice(); // get copy of data able to be manipulated
        flightIndex = findIndicesOfFlights(dataCopy, connid);

        var ret = "";
        var flight;

        for (var i = 0; i < flightIndex.length; i++) {
            flight = data.d.results[flightIndex[i]];
            var date = new Date(parseInt(flight.Fldate.replace("/Date(", "").replace(")/", "")));
            var freeplaces = flight.Seatsmax - flight.Seatsocc;
            ret += `${date.toString().slice(0,15)} (Free places: ${freeplaces})\n`;
        }

        res.json({
            replies: [
                {
                    type: 'text', content: `Here are the flight dates of ${carrid} ${connid}:\n\n${ret}`
                },
            ],
        });
    }).catch(err => {
        res.json({
            replies: [
                {
                    type: 'text', content: `I'm sorry but I didn't find any flight with your criteria.`
                },
            ],
        });
    });
};

function findConnid(req, res) {
    // Get flight dates of a specific Connid
    const carrid = req.body.conversation.memory['airline'].shortname;
    const depcity = req.body.conversation.memory['depcity'].value;
    const arrcity = req.body.conversation.memory['arrcity'].value;
    const name = req.body.conversation.memory['name'].fullname;
    const date = req.body.conversation.memory['date'].iso;

    const URL = "https://sapdemo-s4.exxcellent.de:8001/sap/opu/odata/sap/ZTRAVEL_SRV/ZBC_C_Carrier_TP%28%27" + carrid + "%27%29/to_Connection/?$format=json&sap-client=100&sap-user=skr&sap-password=exxcellent123";

    axiosTest(URL);
    axiosTest(URL).then(data => {
        var dataCopy = data.d.results.slice(); // get copy of data able to be manipulated
        flightIndex = findIndicesOfConnection(dataCopy, depcity, arrcity);
        var URLS = [];
        var flight;
        for (var i = 0; i < flightIndex.length; i++) {
            flight = data.d.results[flightIndex[i]];
            URLS.push("https://sapdemo-s4.exxcellent.de:8001/sap/opu/odata/sap/ZTRAVEL_SRV/ZBC_C_Flight_TP(Carrid=%27" + flight.Carrid + "%27,Connid=%27" + flight.Connid + "%27,Fldate=datetime%27" + date.replace(":", "%3A").replace(":", "%3A").replace("+00:00","") + "%27)/to_Booking");
        }

        res.json({
            replies: [
                {
                    type: 'text', content: `Here are the flight dates of ${carrid}:\n\n${URLS}`
                },
            ],
        });
    }).catch(err => {
        res.json({
            replies: [
                {
                    type: 'text', content: `I'm sorry but I didn't find any flight with your criteria.${URL}`
                },
            ],
        });
    });
};

function findIndicesOfFlights(data, connid) {
    var flightIndex = [];
    var counter = 0;
    while (true) {
        var flight = data.find(p => p.Connid === connid);
        index = data.indexOf(flight);
        if (!flight) {
            break;
        };
        flightIndex.push(counter + index);
        data.splice(0, index + 1); // delete all entries up to index and search for next result
        counter += index + 1;
    }
    return flightIndex;
}

function findIndicesOfConnection(data, depcity, arrcity) {
    var flightIndex = [];
    var counter = 0;
    while (true) {
        var flight = data.find(p => p.Cityfrom.toLowerCase() === depcity.toLowerCase() && p.Cityto.toLowerCase() === arrcity.toLowerCase());
        index = data.indexOf(flight);
        if (!flight) {
            break;
        };
        flightIndex.push(counter + index);
        data.splice(0, index + 1); // delete all entries up to index and search for next result
        counter += index + 1;
    }
    return flightIndex;
}

function axiosTest(URL) {
    return axios.get(URL, { httpsAgent }).then(response => {
        return response.data
    }).catch(err => {
    });
}