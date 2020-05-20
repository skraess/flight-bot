// function getFlights
const getData = require('./getData');
const findIndicesOfConnection = require('./findIndicesOfConnection');
const capitalize = require('./capitalize');

function getFlights(req, res) {
    var departure = req.body.conversation.memory['depcity'].value;
    var arrival = req.body.conversation.memory['arrcity'].value;

    var URL = "https://sapdemo-s4.exxcellent.de:8001/sap/opu/odata/sap/ZTRAVEL_SRV/ZBC_C_Connection_TP/?$format=json&sap-client=100&sap-user=skr&sap-password=exxcellent123";

    if (req.body.conversation.memory['airline'] != null) { // search only in data of entered airline
        const airline = req.body.conversation.memory['airline'].shortname;
        URL = "https://sapdemo-s4.exxcellent.de:8001/sap/opu/odata/sap/ZTRAVEL_SRV/ZBC_C_Carrier_TP%28%27" + airline + "%27%29/to_Connection/?$format=json&sap-client=100&sap-user=skr&sap-password=exxcellent123";
    }

    getData(URL);
    getData(URL).then(data => {
        // Find flight indices with right depcity and arrcity
        var dataCopy = data.d.results.slice(); // get copy of data able to be manipulated
        flightIndex = findIndicesOfConnection(dataCopy, departure, arrival);

        var ret = "";
        var flightsSaved = [];
        var button = []; // prepare button to be returned
        var flight;
                
        if (flightIndex.length === 1) {
            var article = `found one single connection:`;
            var confirmation = 'Do you want to see possible flight dates of this flight?';

            // prepare information of this single sonnection
            flight = data.d.results[flightIndex[0]];
            ret += `\n\nCarrier: ${flight.Carrid} \nConnid: ${flight.Connid} \nFrom: ${flight.Cityfrom} (${flight.Airpfrom}) \nTo: ${flight.Cityto} (${flight.Airpto}) \nDeparture: ${flight.Deptime.replace("PT", "").replace("00S", "")} \nArrival: ${flight.Arrtime.replace("PT", "").replace("00S", "")}`;
            flightsSaved.push(flight);
            button.push({ title: "Yes", value: "Yes, for number 1." });            
        } else {            
            var article = `found totally ${flightIndex.length} different connections:`;
            var confirmation = 'Do you want to see possible flight dates of one of these flights?';
            // prepare list of all connections
            for (var i = 0; i < flightIndex.length; i++) {
                flight = data.d.results[flightIndex[i]];
                ret += `\n\nNo. ${i + 1}:\nCarrier: ${flight.Carrid} \nConnid: ${flight.Connid} \nFrom: ${flight.Cityfrom} (${flight.Airpfrom}) \nTo: ${flight.Cityto} (${flight.Airpto}) \nDeparture: ${flight.Deptime.replace("PT", "").replace("00S", "")} \nArrival: ${flight.Arrtime.replace("PT", "").replace("00S", "")}`;
                flightsSaved.push(flight);
                button.push({ title: "Yes, for No. " + (i + 1), value: "Yes, for number " + (i + 1) + "." });
            }            
        }

        button.push({ title: 'No, thank you', value: 'No.' });

        // prepare memoryupdate
        var memory = req.body.conversation.memory;
        memory.flights = flightsSaved;
        if (flightsSaved.length === 1) {
            memory.searchid = { scalar: 1 };
        }

        if (flightIndex.length === 0) { // No flights found
            res.json({
                replies: [
                    {
                        type: 'text', content: `I'm sorry but I didn't find any flights from ${capitalize(departure)} to ${capitalize(arrival)}.\n`
                    },
                ],
                conversation: {
                    memory: {

                    }
                }
            });
        } else {
            res.json({
                replies: [
                    {
                        type: 'text', content: `I was looking for flights from ${capitalize(departure)} to ${capitalize(arrival)} and ${article} ${ ret }`,
                    },
                    {
                        type: 'quickReplies',
                        content: {
                            title: confirmation,
                            buttons: button,
                        },
                    },
                ],
                conversation: {
                    memory,
                }
            });
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

module.exports = getFlights;