// function findIndicesOfConnection
function findIndicesOfConnection(data, depcity, arrcity) {
    var flightIndex = [];
    var counter = 0;
    while (true) {
        var flight = data.find(p => p.Cityfrom.toLowerCase() === depcity.toLowerCase() && p.Cityto.toLowerCase() === arrcity.toLowerCase());
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

module.exports = findIndicesOfConnection;