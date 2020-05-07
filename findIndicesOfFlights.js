// function findIndicesOfFlights
// returns an array with indices of the flights with given connid
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

module.exports = findIndicesOfFlights;