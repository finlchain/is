//
const Nodegeocoder = require('node-geocoder');
const geocoder = Nodegeocoder({provider: 'openstreetmap', language:'en'});
const os = require("os");
const fs = require('fs');
const groupBy = require('json-groupby');
const execSync = require('child_process').execSync;
const spawn = require('child_process').spawn;
// const zip = require('node-zip');
const zip = new require('node-zip')();
// var zip = require('express-zip');

//
const cryptoSsl = require("./../../../../addon/crypto-ssl");

//
const config = require('./../../config/config.js');
const define = require('./../../config/define.js');
const logger = require('./../../src/utils/winlog.js');

//
module.exports.asyncForEach = async (array, callback) => {
    for(let index = 0; index < array.length; index++)
    {
        await callback(array[index], index, array);
    }
}

//
module.exports.rmdirSync = (dir, opt) => {
    if (fs.existsSync(dir))
    {
        // fs.rmdirSync(path, { recursive: true });
        fs.readdirSync(dir).forEach(function(file,index){
            let curPath = dir + '/' + file;
            // logger.debug("curPath : " + curPath);
            if(fs.lstatSync(curPath).isDirectory())
            { // recurse
                this.rmdirSync(curPath, { recursive: true });
            }
            else
            { // delete file
                fs.unlinkSync(curPath);
            }
        });

        fs.rmdirSync(dir);
    }
}

module.exports.makeZip = (dir, zipFileName, pw) => {
    let ret = false;
    if (fs.existsSync(dir))
    {
        //
        let zipFilePath = dir + '/' + zipFileName;

        //
        fs.readdirSync(dir).forEach(function(file,index){
            let curPath = dir + '/' + file;
            logger.debug("curPath : " + curPath);
            if(fs.lstatSync(curPath).isDirectory())
            {
                //
            }
            else
            {
                zip.file(file, fs.readFileSync(curPath));
            }
        });

        let data = zip.generate({base64:false, compression:'DEFLATE'});
        logger.debug("data complete");
        // fs.writeFileSync(zipFilePath, data, 'binary');

        return data;
    }

    // // Example
    // zip.file('sample.js', fs.readFileSync('./key/ed_privkey.pem'));
    // zip.file('setinterval.js', fs.readFileSync('./key/ed_pubkey.pem'));
    // var data = zip.generate({base64:false, compression:'DEFLATE'});
    // fs.writeFileSync(zipFilePath, data, 'binary');

    return ret;
}

//
module.exports.makeFin = (dir, seed) => {
    let ret = false;

    if (fs.existsSync(dir))
    {
        //
        fs.readdirSync(dir).forEach(function(file,index){
            let curPath = dir + '/' + file;

            logger.debug("curPath : " + curPath);
            if(fs.lstatSync(curPath).isDirectory())
            {
                //
            }
            else
            {
                if (curPath.includes('privkey.pem'))
                {
                    let srcPath = curPath;

                    let dstPath;
                    if (curPath.includes('ed'))
                    {
                        dstPath = dir + '/' + 'ed_privkey.fin';
                    }
                    else
                    {
                        dstPath = dir + '/' + 'privkey.fin';
                    }

                    logger.debug('seed : ' + seed);
                    
                    let encFile = cryptoSsl.aesEncFile(srcPath, dstPath, seed, seed.length);
                    if(encFile === true)
                    {
                        ret = true;
                    }

                    logger.debug('encFile : ' + encFile);

                    // let decFile = cryptoSsl.aesDecFile(dstPath, seed, seed.length);
                    // logger.debug("decFile : " + decFile);

                    return ret;
                }
            }
        });
    }

    return ret;
}

//
module.exports.getMemInfo = () => {
    const mem = {
        freemem: os.freemem(),
        totalmem: os.totalmem()
    };
    mem.available = (mem.freemem * 100 / mem.totalmem).toFixed(2) + '%';

    return mem;
}

//
module.exports.checkIP = (ipAddr) => {
    if(define.REGEX.IP_ADDR_REGEX.test(ipAddr))
    {
        return true;
    }
    return false;
}

module.exports.getMyIPs = () => {
    const nets = os.networkInterfaces();
    let myIpArr = new Array();

    for (const name of Object.keys(nets))
    {
        for (const net of nets[name])
        {
            // skip over non-ipv4 and internal (i.e. 127.0.0.1) addresses
            if (net.family === 'IPv4' && !net.internal)
            {
                myIpArr.push(net.address);
                // logger.debug("Net Name : " + name + ", IP : " + net.address);
            }
        }
    }

    return myIpArr;
}

module.exports.getMyCtrlIP = () => {
    let localIPs = this.getMyIPs();
    let localIP = localIPs[config.IP_ASSIGN.CTRL];

    return (localIP);
}

module.exports.getMyDataIP = () => {
    let localIPs = this.getMyIPs();
    let localIP = localIPs[config.IP_ASSIGN.DATA];

    return (localIP);
}

module.exports.getMyReplIP = () => {
    let localIPs = this.getMyIPs();
    let localIP = localIPs[config.IP_ASSIGN.REPL];

    return (localIP);
}

module.exports.isMyIP = (ip) => {
    const nets = os.networkInterfaces();

    for (const name of Object.keys(nets))
    {
        for (const net of nets[name])
        {
            // skip over non-ipv4 and internal (i.e. 127.0.0.1) addresses
            if (net.family === 'IPv4' && !net.internal)
            {
                if (ip === net.address)
                {
                    return true;
                }
            }
        }
    }

    return false;
}

module.exports.int2ipLast = (ipInt) => {
    let ip = "***.***.***.";
    ip += (ipInt & 255).toString(); 
    return ip;
}

module.exports.ip2int = (ip) => {
    return ip.split('.').reduce(function(ipInt, octet) { return (ipInt << 8) + parseInt(octet, 10)}, 0) >>> 0;
}

module.exports.ipToInt = (ip) => {
    let parts = ip.split(".");
    let res = 0;

    res += parseInt(parts[0], 10) << 24;
    res += parseInt(parts[1], 10) << 16;
    res += parseInt(parts[2], 10) << 8;
    res += parseInt(parts[3], 10);

    return res;
}

module.exports.intToIP = (ipInt) => {
    let part1 = ipInt & 255;
    let part2 = ((ipInt >> 8) & 255);
    let part3 = ((ipInt >> 16) & 255);
    let part4 = ((ipInt >> 24) & 255);

    return part4 + "." + part3 + "." + part2 + "." + part1;
}

//
module.exports.getHostname = () => {
    return (os.hostname());
}

//
module.exports.padding = (data, len, separator) => {
    if(separator === define.COMMON_DEFINE.PADDING_DELIMITER.FRONT)
    {
        while(data.length < len)
        {
            data = "0" + data;

            if(data.length === len) break;
            else continue;
        }
    }
    else if(separator === define.COMMON_DEFINE.PADDING_DELIMITER.BACK)
    {
        while(data.length < len)
        {
            data = data + "0";

            if(data.length === len) break;
            else continue;
        }
    }
    return data;
}

module.exports.paddy = (num, padLen, padChar) => {
    let pad_char = typeof padChar !== 'undefined' ? padChar : '0';
    let pad = new Array(1 + padLen).join(pad_char);

    return (pad + num).slice(-pad.length);
}

// Left Padding with '0'
module.exports.leftPadding = (n, width)=>{
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
}

// Right Padding with '0'
module.exports.rightPadding = (n, width) => {
    n = n + '';
    return n.length >= width ? n : n + new Array(width - n.length + 1).join('0');
}

//
module.exports.isIntegerValue = (strNum) => {
    return Number.isInteger(parseInt(strNum));
}

module.exports.isArray = (arr) => {
    // return (!!arr) && (arr.constructor === Array);
    return Array.isArray(arr);
}

module.exports.isObject = (obj) => {
    return (!!obj) && (obj.constructor === Object);
}

module.exports.isQueryResultObject = (variable) => {
    return variable === Object(variable);
}

module.exports.isJsonString = (str) =>{
    try
    {
        var isObj = JSON.parse(str);

        if (isObj && typeof isObj === "object")
        {
            return true;
        }
    }
    catch (e)
    {
        return false;
    }
    
    return false;
}

//
module.exports.bytesToBuffer = (bytes) => {
    var buff = Buffer.alloc(bytes.byteLength);
    var view = new Uint8Array(bytes);
    
    for(var i = 0; i < buff.length; i++)
    {
        buff[i] = view[i];
    }
    return buff;
}

//
module.exports.stringSplit = (text, separator, limit) => {
    let splitArray;

    if(limit !== null)
    {
        text = text.split(separator, limit);     
    }
    else
    {
        text = text.split(separator);
    }
    splitArray = [...text];
    return splitArray;
}

module.exports.stringReplace = (str, searchStr, replaceStr) => {
    return str.split(searchStr).join(replaceStr);
}

// module.exports.hexStr2u64 = (hexStr) => {
//     let num = BigInt('0x' + hexStr);
//     return num;
// }

module.exports.appendHexPrefix = function(data){
    return '0x'+data;
}

module.exports.hexStrToBigInt = (hexStr) => { // Big Number
    // https://coolaj86.com/articles/convert-hex-to-decimal-with-js-bigints/
    let num = BigInt('0x' + hexStr);
    return num;
}

module.exports.hexStrToInt = (hexStr) => { // Integer
    let num = parseInt(hexStr, 16);
    return num;
}

// module.exports.intToHexStr = (num) => { // Not Big Number
//     // logger.debug("100000000000000B : " + BigInt('1152921504606846987').toString(16));
//     let hexStr = Number(num).toString(16);
//     return hexStr;
// }

module.exports.intArrToChar = (arr) => {
    var i, str = '';

    for (i = 0; i < arr.length; i++)
    {
        str += '%' + ('0' + arr[i].toString(16)).slice(-2);
    }
    str = decodeURIComponent(str);

    return str;
}

module.exports.intToStr = (num) => {
    let hexStr = Number(num).toString();
    return hexStr;
}

module.exports.strToInt = (str) => {
    let num = parseInt(str);
    return num;
}

//
module.exports.numToFixed = (num, decimal_point) => {
    let fixedNum = (Number(num)).toFixed(decimal_point);

    return (fixedNum);
}

//
module.exports.copyObj = (obj) => {
    var clone = {};
    for (var i in obj)
    {
        if(typeof(obj[i]) === "object" && obj[i] !== null)
        {
            clone[i] = this.copyObj(obj[i]);
        }
        else
        {
            clone[i] = obj[i];
        }

    }

    return clone;
}

// // Random
// function getRandomArbitrary(min, max)
// {
//     return Math.random() * (max - min) + min;
// }

/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
module.exports.getRandomInt = (min, max) => {  
    min = Math.ceil(min);
    max = Math.floor(max);
    return (Math.floor(Math.random() * (max - min) + min));
}

/**
 * Returns a random number between min (inclusive) and max (inclusive)
 */
module.exports.getRandomIntInclusive = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    const num = Math.floor(Math.random() * (max - min + 1) + min);

    return (num);
}

module.exports.getRandomNumBuf = (len, minNum, maxNum) => {
    var buff = Buffer.alloc(len);

    var min_num = typeof minNum !== 'undefined' ? minNum : 0;
    var max_num = typeof maxNum !== 'undefined' ? maxNum : 255;

    for(var i = 0; i < buff.length; i++)
    {
        buff[i] = this.getRandomIntInclusive(min_num, max_num);
    }

    return buff;
}

//
module.exports.sleep = (ms) => {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

module.exports.chkDelayTimeInMS = (prvTime, nowTime) => {
    let delayTime = delayTime - prvTime;

    return (delayTime);
}

module.exports.timeStampMS = async() => {
    return String(Math.floor(+ new Date()));
}

module.exports.timeStampSEC = async() => {
    return String(Math.floor(+new Date()/1000));
}

module.exports.getDateMS = () => {
    let msec = Date.now();

    return msec;
}

//////////////////////////////////////
// ExecSync
// 
module.exports.getCmdStr = (cmd) => {
    return cmd.split(os.EOL)[0];
}

module.exports.getCmdStrArr = (cmd) => {
    let arr = cmd.split(os.EOL);
    arr.pop();

    return arr;
}

module.exports.getResult = async (cmd) => {
    let cmdResult = execSync(cmd, config.CMD_ENCODING);

    return this.getCmdStr(cmdResult);
}

module.exports.getResultArr = async(cmd) => {
    let cmdResult = execSync(cmd, config.CMD_ENCODING);
    
    return this.getCmdStrArr(cmdResult);
}

module.exports.parseIntArrSum = (arr) => {
    let result = 0;
    for(var i = 0; i < arr.length; i++)
    {
        result += parseInt(arr[i]);
    }

    return result;
}

module.exports.parseIntArr = (arr) => {
    let retArr = new Array();
    for(var i = 0; i<arr.length; i++)
    {
        retArr[i] = parseInt(arr[i]);
    }

    return retArr;
}

//
// geocoderReverse() => call back
const geocoderReverseCB = (latitude, longitude) => {
    return new Promise((resolve, reject) => {
        geocoder.reverse({ lat: latitude, lon: longitude })
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                reject(err);
            });
    });
}

// Country and City obtained by GPS value
module.exports.geocoderReverse = async (latitude, longitude) => {
    let res = await geocoderReverseCB(latitude, longitude);
    let object = {
        country: res[0].countryCode,
        city: res[0].city
    }

    return object;
}

module.exports.p2pAddr2geo = async (p2pAddr) => {
    let geoValue = p2pAddr.substr(2, 8);
    
    let lat_float = parseInt(geoValue.substr(2, 2), 16);
    lat_float = lat_float > 10 ? lat_float : "0" + lat_float; 
    let lat = [parseInt(geoValue.substr(0, 2), 16), lat_float];

    let lon_float = parseInt(geoValue.substr(6, 2), 16);
    lon_float = lon_float > 10 ? lon_float : "0" + lon_float;
    let lon = [parseInt(geoValue.substr(4, 2), 16), lon_float];

    let geo = await this.geocoderReverse(lat.join('.'), lon.join('.'));

    return geo.country + " " + geo.city;
}

module.exports.groupByArr = (json_arr, key_arr, col_arr) => {
    return groupBy(json_arr, key_arr, col_arr);
}

// ??????????
module.exports.json2Array = (json_data) => {
    var result = [];

    for(var key in json_data){
        if(json_data.hasOwnProperty(key)) {
            result.push({subnet : key, nodes : json_data[key]});
        }
    }

    return result;
}

/////////////////////////////////////////
//
//
module.exports.chkDecimalPoint = (num) => {
    let splitNum = num.split('.');

    return splitNum;
}

//
module.exports.calNum = (num1, operator, num2, decimal_point) => {
    // https://zorba91.tistory.com/266
    let calVal = define.ERR_CODE.ERROR;
    switch (operator)
    {
    case '+':
        calVal = (Number(num1) + Number(num2)).toFixed(decimal_point);
        break;
    case '-':
        calVal = (Number(num1) - Number(num2)).toFixed(decimal_point);
        break;
    case '*':
        calVal = (Number(num1) * Number(num2)).toFixed(decimal_point);
        break;
    case '/':
        calVal = (Number(num1) / Number(num2)).toFixed(decimal_point);
        break;
    default :
        break;
    }

    return calVal;
}

//
module.exports.balNum = (balance, amount, decimal_point) => {
    let calVal = +(Number(balance) - Number(amount)).toFixed(decimal_point);
    if (calVal < 0)
    {
        return false;
    }

    return true;
}

//
module.exports.date2Timestamp = (strDate) => {
    const dt = Date.parse(strDate);  

    return dt;
}

//
module.exports.timestamp2Date = (ts) => {
    const td = new Date(ts);

    return td;
}
