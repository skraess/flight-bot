// Function getFlightDates
// Get flight dates of a specific Connid
const getData = require('./getData');
const findIndicesOfFlights = require('./findIndicesOfFlights');

function getFlightDates(req, res) {
    const searchid = req.body.conversation.memory['searchid'].scalar - 1;
    const carrid = req.body.conversation.memory.flights[searchid].Carrid;
    const connid = req.body.conversation.memory.flights[searchid].Connid;

    const URL = "https://sapdemo-s4.exxcellent.de:8001/sap/opu/odata/sap/ZTRAVEL_SRV/ZBC_C_Carrier_TP%28%27" + carrid + "%27%29/to_Flight/?$format=json&sap-client=100&sap-user=skr&sap-password=exxcellent123";

    getData(URL);
    getData(URL).then(data => {
        var dataCopy = data.d.results.slice(); // get copy of data able to be manipulated
        flightIndex = findIndicesOfFlights(dataCopy, connid);

        var ret = "";
        var flight;

        for (var i = 0; i < flightIndex.length; i++) {
            flight = data.d.results[flightIndex[i]];
            var date = new Date(parseInt(flight.Fldate.replace("/Date(", "").replace(")/", "")));
            var freeplaces = flight.Seatsmax - flight.Seatsocc;
            ret += `${date.toString().slice(0, 15)} (Free places: ${freeplaces})\n`;
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

module.exports = getFlightDates;