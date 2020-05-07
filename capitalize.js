// JavaScript source code
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function capitalize(string) {
    var split = string.split(" ");
    var ret = "";
    for (i = 0; i < split.length; i++) {
        ret += capitalizeFirstLetter(split[i]);
        if (i < split.length - 1) {
            ret += ` `;
        }
    }
    return ret;
}

module.exports = capitalize;