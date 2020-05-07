// function findIndexOfPassenger
// returns passenger object with given name
function findPassenger(data, name) {
    var passenger = data.find(p => p.Passname.toLowerCase() === name.toLowerCase()); 
    return passenger; 
}

module.exports = findPassenger;