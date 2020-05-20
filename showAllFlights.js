// shows all flight dates between two cities
const getData = require('./getData');
const findIndicesOfFlights = require('./findIndicesOfFlights');
const findIndicesOfConnection = require('./findIndicesOfConnection');
const capitalize = require('./capitalize');

function showAllFlights(req, res) {
    const depcity = req.body.conversation.memory['depcity'].value;
    const arrcity = req.body.conversation.memory['arrcity'].value;

    var URL = "https://sapdemo-s4.exxcellent.de:8001/sap/opu/odata/sap/ZTRAVEL_SRV/ZBC_C_Connection_TP/?$format=json&sap-client=100&sap-user=skr&sap-password=exxcellent123";

    getData(URL);
    getData(URL).then(data => {
        // Find flight indices with right depcity and arrcity
        var dataCopy = data.d.results.slice(); // get copy of data able to be manipulated
        flightIndex = findIndicesOfConnection(dataCopy, depcity, arrcity);

        var flightsSaved = [];
        var flight;

        // get all connections from depcity to arrcity
        for (var i = 0; i < flightIndex.length; i++) {
            flight = data.d.results[flightIndex[i]];
            flightsSaved.push(flight);
        }

        if (flightsSaved.length === 0) { // No connections found
            res.json({
                replies: [
                    {
                        type: 'text', content: `It seems that there are no flights from ${capitalize(depcity)} to ${capitalize(arrcity)}.\n`
                    },
                ],
                conversation: {
                    memory: {

                    }
                }
            });
        } else {
            var URLS = [];

            // prepare URLS for different carrier
            for (var i = 0; i < flightsSaved.length; i++) {
                URLS.push("https://sapdemo-s4.exxcellent.de:8001/sap/opu/odata/sap/ZTRAVEL_SRV/ZBC_C_Carrier_TP%28%27" + flightsSaved[i].Carrid + "%27%29/to_Flight/?$format=json&sap-client=100&sap-user=skr&sap-password=exxcellent123");             
            }

            var ret = ""; // String for saving data in right format
            var counter = 0;

            // prepare memoryupdate
            var memory = req.body.conversation.memory;
            memory.flights = flightsSaved;

            var connidsChecked = []; // array to mark already checked connids
            for (var i = 0; i < flightsSaved.length; i++) {
                connidsChecked.push(0);
            }

            for (var i = 0; i < URLS.length; i++) {
                getData(URLS[i]);
                getData(URLS[i]).then(response => {
                    counter++;

                    var dataCopy = response.d.results.slice(); // get copy of data able to be manipulated
                    var flightIndex =[]; 

                    // find flightIndices with correct connid
                    for (var j = 0; j < flightsSaved.length && flightIndex.length < 1; j++) {
                        if (connidsChecked[j] === 0) {
                            flightIndex = findIndicesOfFlights(dataCopy, flightsSaved[j].Connid);
                            if (flightIndex.length > 0) {
                                connidsChecked[j] = 1;
                            }
                        }
                    }

                    var flight;
                    var curDate = new Date();

                    // get dates of flights found
                    ret += `${response.d.results[0].Carrid} ${response.d.results[flightIndex[0]].Connid}:\n`
                    for (var i = 0; i < flightIndex.length; i++) {
                        flight = response.d.results[flightIndex[i]];
                        var date = new Date(parseInt(flight.Fldate.replace("/Date(", "").replace(")/", "")));
                        var freeplaces = flight.Seatsmax - flight.Seatsocc;
                        if (date.getTime() > curDate.getTime() && freeplaces > 0) { // check if flight is in future or past and not sold out
                            ret += `${date.toString().slice(0, 15)}\n`;// (Free places: ${freeplaces})\n`;
                        }
                    }         

                    // when all connids were checked then return flights to user
                    if (counter === URLS.length) {
                        res.json({
                            replies: [
                                {
                                    type: 'text', content: `Here are all dates for possible flights from ${capitalize(depcity)} to ${capitalize(arrcity)}:\n\n${ret}`,
                                },
                            ],
                            conversation: {
                                memory,
                            }
                        });
                    } else {
                        ret += `\n`;
                    }

                }).catch(err => {
                    console.log(err);
                    res.json({
                        replies: [
                            {
                                type: 'text', content: `Something must have gone wrong. Please try to explain your matter once again.`
                            },
                        ],
                    });
                });
            }
        }
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

module.exports = showAllFlights;