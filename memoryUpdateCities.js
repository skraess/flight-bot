// function memoryUpdateCities
// saves depcity and arrcity of flights in memory
function memoryUpdateCities(req, res) {
    var memory = req.body.conversation.memory;
    if (req.body.conversation.memory.depcity === undefined) {
        const depcity = req.body.conversation.memory.flights[0].Cityfrom;
        memory.depcity = { value: depcity };
    }

    if (req.body.conversation.memory.arrcity === undefined) {
        const arrcity = req.body.conversation.memory.flights[0].Cityto;
        memory.arrcity = { value: arrcity };
    }

    res.json({
        conversation: {
            memory,
        }
    });
}

module.exports = memoryUpdateCities;