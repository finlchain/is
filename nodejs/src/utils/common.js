module.exports.timeStampMS = async() => {
    return String(Math.floor(+ new Date()));
}

module.exports.timeStampSEC = async() => {
    return String(Math.floor(+new Date()/1000));
}

module.exports.CheckJson = async (str) => {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

module.exports.leftPadding = (n, width)=>{
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
}


module.exports.rightPadding = (n, width) => {
    n = n + '';
    return n.length >= width ? n : n + new Array(width - n.length + 1).join('0');
}

module.exports.asyncForEach = async (array, callback) => {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}