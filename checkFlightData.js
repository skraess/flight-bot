// function check-flight-date
// checks if there is a flight with the given data
const getData = require('./getData');
const findIndicesOfConnection = require('./findIndicesOfConnection');

function checkFlightData(req, res) { 
    const carrid = req.body.conversation.memory['airline'].shortname;
    const depcity = req.body.conversation.memory['depcity'].value;
    const arrcity = req.body.conversation.memory['arrcity'].value;
    const flightdate = req.body.conversation.memory['date'].iso.replace("+00:00", ".000Z");

    var URL = "https://sapdemo-s4.exxcellent.de:8001/sap/opu/odata/sap/ZTRAVEL_SRV/ZBC_C_Carrier_TP%28%27" + carrid + "%27%29/to_Connection/?$format=json&sap-client=100&sap-user=skr&sap-password=exxcellent123";

    var finalConnid;

    getData(URL);
    getData(URL).then(data => {
        var connids = [];
        var flightIndices;
        var dataCopy = data.d.results.slice();
        flightIndices = findIndicesOfConnection(dataCopy, depcity, arrcity);

        for (var i = 0; i < flightIndices.length; i++) {
            connids.push(data.d.results[flightIndices[i]].Connid);
        }

        var URL2 = "https://sapdemo-s4.exxcellent.de:8001/sap/opu/odata/sap/ZTRAVEL_SRV/ZBC_C_Carrier_TP%28%27" + carrid + "%27%29/to_Flight/?$format=json&sap-client=100&sap-user=skr&sap-password=exxcellent123";

        getData(URL2);
        getData(URL2).then(response => {
            // search for flights with the given data
            var date1 = new Date(flightdate).toLocaleString();
            var found = "false";
            for (var i = 0; i < response.d.results.length; i++) {
                var flight = response.d.results[i];
                if (flight.Carrid.toLowerCase() === carrid.toLowerCase() && flight.Connid.toLowerCase() === connids[0].toLowerCase()) {
                    var date2 = new Date(parseInt(flight.Fldate.replace("/Date(", "").replace(")/", ""))).toLocaleString();
                    if (date1 === date2) {
                        found = "true";
                        finalConnid = flight.Connid;
                        break;
                    }
                }
            }

            // adopt format of memory values
            var memory = req.body.conversation.memory;
            memory.depcity.value = memory.depcity.value.toUpperCase();
            memory.arrcity.value = memory.arrcity.value.toUpperCase();
            memory.name.raw = memory.name.raw.toUpperCase();
            memory.date.formatted = memory.date.formatted.replace("at 12:00:00 AM (+0000)", "");
            memory.connid = { raw: finalConnid , number: finalConnid};

            // set new variable in memory to remember if flight was found
            if (found === "false") {
                memory.checked = "no";
            } else {
                memory.checked = "yes";
            }

            res.json({
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
    });
}

module.exports = checkFlightData;

