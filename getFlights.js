// function getFlights
const getData = require('./getData');
const findIndicesOfConnection = require('./findIndicesOfConnection');

function getFlights(req, res) {
    const depcity = req.body.conversation.memory['depcity'].value;
    const arrcity = req.body.conversation.memory['arrcity'].value;

    var URL = "https://sapdemo-s4.exxcellent.de:8001/sap/opu/odata/sap/ZTRAVEL_SRV/ZBC_C_Connection_TP/?$format=json&sap-client=100&sap-user=skr&sap-password=exxcellent123";

    if (req.body.conversation.memory['airline'] != null) { // search only in data of entered airline
        const airline = req.body.conversation.memory['airline'].shortname;
        URL = "https://sapdemo-s4.exxcellent.de:8001/sap/opu/odata/sap/ZTRAVEL_SRV/ZBC_C_Carrier_TP%28%27" + airline + "%27%29/to_Connection/?$format=json&sap-client=100&sap-user=skr&sap-password=exxcellent123";
    }

    getData(URL);
    getData(URL).then(data => {
        // Find flight indices with right depcity and arrcity
        var dataCopy = data.d.results.slice(); // get copy of data able to be manipulated
        flightIndex = findIndicesOfConnection(dataCopy, depcity, arrcity);

        var ret = "";
        var flightsSaved = [];
        var button = [];
        var flight;

        for (var i = 0; i < flightIndex.length; i++) {
            flight = data.d.results[flightIndex[i]];
            ret += `\n\nNo. ${i + 1}:\nCarrier: ${flight.Carrid} \nConnid: ${flight.Connid} \nFrom: ${flight.Cityfrom} (${flight.Airpfrom}) \nTo: ${flight.Cityto} (${flight.Airpto}) \nDeparture: ${flight.Deptime.replace("PT", "").replace("00S", "")} \nArrival: ${flight.Arrtime.replace("PT", "").replace("00S", "")}`;
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

module.exports = getFlights;