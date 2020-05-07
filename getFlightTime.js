// function getFlightTime
// Outputs departure and arrival time of specific flight
const getData = require('./getData');
const capitalize = require('./capitalize');

function getFlightTime(req, res) {
    const airline = req.body.conversation.memory['airline'].shortname;
    const connid = req.body.conversation.memory['connid'].raw;
    const date = req.body.conversation.memory['date'].iso.replace("+00:00", "");

    const URL = "https://sapdemo-s4.exxcellent.de:8001/sap/opu/odata/sap/ZTRAVEL_SRV/ZBC_C_Flight_TP(Carrid=%27" + airline + "%27,Connid=%27" + connid + "%27,Fldate=datetime%27" + date + "%27)/to_Connection/?$format=json&sap-client=100&sap-user=skr&sap-password=exxcellent123";

    getData(URL);
    getData(URL).then(data => {
        // Get departure and arrival time
        const deptime = data.d.Deptime.replace("PT", "").replace("00S", "");
        const arrtime = data.d.Arrtime.replace("PT", "").replace("00S", "");

        res.json({
            replies: [
                {
                    type: 'text', content: `Your flight will leave ${capitalize(data.d.Cityfrom.toLowerCase())}(${data.d.Airpfrom}) at ${deptime} and will land in ${capitalize(data.d.Cityto.toLowerCase())}(${data.d.Airpto}) at ${arrtime}.`
                },
            ],
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

module.exports = getFlightTime;