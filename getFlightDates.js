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

        var ret = ""; // String for saving dates in right fromat
        var flight;

        var curDate = new Date();

        // getDates of flights found
        for (var i = 0; i < flightIndex.length; i++) {
            flight = data.d.results[flightIndex[i]];
            var date = new Date(parseInt(flight.Fldate.replace("/Date(", "").replace(")/", "")));
            var freeplaces = flight.Seatsmax - flight.Seatsocc;
            if (date.getTime() > curDate.getTime() && freeplaces > 0) { // check if flight is in future or past and not sold out
                ret += `${date.toString().slice(0, 15)} (Free places: ${freeplaces})\n`;
            }
        }

        // prepare memory update
        var memory = req.body.conversation.memory;
        memory.connid = {raw: connid };
        memory.airline = { shortname: carrid };

        res.json({
            replies: [
                {
                    type: 'text', content: `Here are the flight dates of ${carrid} ${connid}:\n\n${ret}`
                },
            ],
            conversation: {
                memory,
            }
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

module.exports = getFlightDates;