// function confirmBooking
// checks if booking was successful and outputs Booking ID and Connection ID
const getData = require('./getData');
const findPassenger = require('./findPassenger');

function confirmBooking(req, res) {
    var carrid = req.body.conversation.memory['airline'].shortname;
    var connid = req.body.conversation.memory['connid'].raw;
    var name = req.body.conversation.memory['name'].fullname;
    var date = req.body.conversation.memory['date'].iso.replace("+00:00", "");

    // list of bookings for demanded flight
    var URL = "https://sapdemo-s4.exxcellent.de:8001/sap/opu/odata/sap/ZTRAVEL_SRV/ZBC_C_Flight_TP(Carrid=%27" + carrid + "%27,Connid=%27" + connid + "%27,Fldate=datetime%27" + date.replace(":", "%3A").replace(":", "%3A") + "%27)/to_Booking/?$format=json&sap-client=100&sap-user=skr&sap-password=exxcellent123";

    getData(URL);
    getData(URL).then(data => {        
        var passenger = findPassenger(data.d.results.slice().reverse(), name); // returns last passenger object in list with given name
        if (!passenger) {
            res.json({
                replies: [
                    {
                        type: 'text', content: `Something must have gone wrong. Please try your booking once again.`
                    },
                ],
            });
        } else {
            res.json({
                replies: [
                    {
                        type: 'text', content: `Great, the booking of your flight was successfull. For any further questions please note that your Booking ID is ${passenger.Bookid} and your Connection ID ${passenger.Connid}.`
                    },
                ],
            });
        }
    }).catch(err => {
        res.json({
            replies: [
                {
                    type: 'text', content: `Something must have gone wrong. Please try your booking once again.`
                },
            ],
        });
    });
}

module.exports = confirmBooking;