// function findConnid
// tells the user the connid of his flight
const getData = require('./getData');
const findIndicesOfConnection = require('./findIndicesOfConnection');
const findPassenger = require('./findPassenger');

function findConnid(req, res) {
    const carrid = req.body.conversation.memory['airline'].shortname;
    const depcity = req.body.conversation.memory['depcity'].value;
    const arrcity = req.body.conversation.memory['arrcity'].value;
    const name = req.body.conversation.memory['name'].fullname;
    const date = req.body.conversation.memory['date'].iso;

    const URL = "https://sapdemo-s4.exxcellent.de:8001/sap/opu/odata/sap/ZTRAVEL_SRV/ZBC_C_Carrier_TP%28%27" + carrid + "%27%29/to_Connection/?$format=json&sap-client=100&sap-user=skr&sap-password=exxcellent123";

    getData(URL);
    getData(URL).then(data => {
        var dataCopy = data.d.results.slice(); // get copy of data able to be manipulated
        flightIndex = findIndicesOfConnection(dataCopy, depcity, arrcity);

        // prepare URLS to search in
        var URLS = [];
        var flight;
        for (var i = 0; i < flightIndex.length; i++) {
            flight = data.d.results[flightIndex[i]];
            URLS.push("https://sapdemo-s4.exxcellent.de:8001/sap/opu/odata/sap/ZTRAVEL_SRV/ZBC_C_Flight_TP(Carrid=%27" + flight.Carrid + "%27,Connid=%27" + flight.Connid + "%27,Fldate=datetime%27" + date.replace(":", "%3A").replace(":", "%3A").replace("+00:00", "") + "%27)/to_Booking/?$format=json&sap-client=100&sap-user=skr&sap-password=exxcellent123");
        }

        var connids = [];
        var curConnid;
        var counter = 0; //counts how many getData already ran

        // Get data from URLS obtained; PROMISE BASED!! So one has to check if the data of all URLS has already been integrated (-> counter)
        for (var i = 0; i < URLS.length; i++) {
            getData(URLS[i]);
            getData(URLS[i]).then(info => {
                counter++;

                var infoCopy = info.d.results.slice();
                if (infoCopy[0] != null) { // if data empty then there is no flight with given connid at given date
                    curConnid = findPassenger(infoCopy, name).Connid;
                    if (!curConnid) { // passenger not found in current list
                    } else {
                        connids.push(curConnid); // there is a passenger with the given name in this list
                    }
                }

                if (counter === URLS.length) { // response to bot when we searched for the name in all URLS 
                    var memory = req.body.conversation.memory;
                    memory.connid = { raw: connids[0], number: connids[0] };

                    if (connids.length === 1) {
                        res.json({
                            replies: [
                                {
                                    type: 'text', content: `The connid of your flight is ${connids[0]}.`
                                },
                            ],
                            conversation: {
                                memory,
                            }
                        });
                    } 
                }
            }).catch(err2 => {
                res.json({
                    replies: [
                        {
                            type: 'text', content: `Something must have gone wrong. Please try to explain your matter once again.`
                        },
                    ],
                });
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

module.exports = findConnid;