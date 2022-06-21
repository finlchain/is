//
const iplocation = require('iplocation').default;
const distance = require('gps-distance');

//
const config = require('./../../config/config.js');
const define = require('./../../config/define.js');
const dbUtil = require('./../db/dbUtil.js');
const dbIS = require('./../db/dbIS.js');
const util = require('../utils/commonUtil.js');

const logger = require('./../utils/winlog.js');

//
let separator = define.SOCKET_ARG.SEPARATOR;

//
module.exports.socketWrite = function(socket, data){
    let msg = data + separator;
    let result = socket.write(msg);
}

// 
module.exports.sendNetCmd = (socket, netCmd, netData) => {
    let msg = {};
    msg.cmd = netCmd;
    if (typeof netData !== 'undefined')
    {
        msg.data = netData;
    }
    else
    {
        msg.data = '';
    }
    
    let msgJson = JSON.stringify(msg);

    logger.debug("msgJson : " + msgJson);

    this.socketWrite(socket, msgJson);
}

//
module.exports.inet_ntoa = function(num){
    let nbuffer = new ArrayBuffer(4);
    let ndv = new DataView(nbuffer);
    ndv.setUint32(0, num);

    let a = new Array();
    for (var i = 0; i < 4; i++) {
        a[i] = ndv.getUint8(i);
    }
    return a.join('.');
}

module.exports.inet_aton = async function(str) {
    let nip = 0;
    await str.split('.').forEach((octet) => {
        nip <<= 8;
        nip+=parseInt(octet);
    });
    return (nip >>> 0);
}

//
module.exports.ipUtil = async (socket, division) => {
    if (division === define.DIVISION.LOCALHOST) {
        var localhost = define.IP.LOCALHOST;
        return (localhost);
    }
    else if (division === define.DIVISION.REMOTE_IP) {
        var remote_ip = (socket.remoteAddress).slice(7);
        return (remote_ip);
    }
    else if (division === define.DIVISION.LOCAL_IP) {
        var local_ip = (socket.localAddress).slice(7);
        return (local_ip);
    }
    else if (division === define.DIVISION.LOCAL_PORT) {
        var local_port = socket.localPort;
        return (local_port);
    }
    else if (division === define.DIVISION.REMOTE_PORT) {
        var remote_port = socket.remotePort;
        return (remote_port);
    }
    else if (division === define.DIVISION.EMPTY_IP) {
        var ip = define.IP.EMPTY;
        return (ip);
    }
    else if (division === define.DIVISION.EMPTY_PORT) {
        var port = 0;
        return (port);
    }
}

//
module.exports.getTopicName = async function (p2paddr) {
    let topic;
    let idcInfo = await JSON.parse(await dbUtil.query(dbIS.querys.is.hub_info.selectHubInfo));

    let latitude1 = parseInt((p2paddr).slice(0, 2), 16);
    let latitude2 = parseInt((p2paddr).slice(2, 4), 16);
    let latitude = latitude1 + (latitude2 / 100);

    let longitude1 = parseInt((p2paddr).slice(4, 6), 16);
    let longitude2 = parseInt((p2paddr).slice(6, 8), 16);
    let longitude = longitude1 + (longitude2 / 100);

    let distance = new Array();
    for (var i = 0; i < idcInfo.latitude.length; i++) {
        let p = parseFloat(idcInfo.latitude[i]) - latitude;
        let q = parseFloat(idcInfo.longitude[i]) - longitude;
        let pq = p * p + q * q;
        let index = new Object();
        index.Name = idcInfo.name[i];
        index.Distance = pq;
        distance.push(index);
    }
    var sortingField = "Distance";
    var min = distance.sort(function (a, b) {
        return a[sortingField] - b[sortingField];
    });

    let designatedIDC = await dbUtil.queryPre(dbIS.querys.is.hub_info.selectHubInfoByName, [min[0].Name]);
    if (designatedIDC.length)
    {
        let base_p2p = calcP2pAddrFromGPS(parseFloat(designatedIDC.latitude[0]), parseFloat(designatedIDC.longitude[0]));
        topic = base_p2p + (parseInt(designatedIDC.idc_code[0]) + 0x1000).toString(16).substr(-3).toUpperCase() + '0';
    }
    else
    {
        logger.error("Error - No data from hub_info table");
    }

    return topic;
}

//
// Compare coordinate values to obtain the nearest IDC center
module.exports.nearestIDC = async (ip) => {
    let idc_gps = await JSON.parse(await dbUtil.query(dbIS.querys.is.hub_info.selectHubInfo));
    let distance_arr = new Array();
    let choice_idc = define.ERR_CODE.ERROR;
    let min;
    let idc_hub_code = iplocation(ip)
        .then((res) => {
            for (var i = 0; i < idc_gps.latitude.length; i++) {
                distance_arr.push(distance(res.latitude, res.longitude, idc_gps.latitude[i], idc_gps.longitude[i]));
            }
            min = distance_arr[0];
            for (var j = 0; j < distance_arr.length; j++) {
                if (min > distance_arr[j]) {
                    min = distance_arr[j];
                    choice_idc = j
                }
            }
            if (choice_idc === define.ERR_CODE.ERROR)
            {
                choice_idc = 0;
            }
            return idc_gps.hub_code[choice_idc];
        })
        .catch(err => {
            logger.warn("Invalid CLI's IP Address");
        })
    return idc_hub_code;
}

// Converts coordinates to P2P_ADDR.
function calcP2pAddrFromGPS(latitude, longitude) {
    //
    let fixedLatitude = util.numToFixed(latitude, define.P2P_DEFINE.P2P_GPS_DECIMAL_POINT);
    let fixedLongitude = util.numToFixed(longitude, define.P2P_DEFINE.P2P_GPS_DECIMAL_POINT);

    //
    let change_latitude1 = Math.floor(fixedLatitude);
    let change_latitude2 = Math.floor((fixedLatitude - change_latitude1).toPrecision(3) * 100);
    let change_longitude1 = Math.floor(fixedLongitude);
    let change_longitude2 = Math.floor((fixedLongitude - change_longitude1).toPrecision(3) * 100);

    //
    if (change_latitude1 < 16) {
        change_latitude1 = '0' + change_latitude1.toString(16);
    } else {
        change_latitude1 = change_latitude1.toString(16);
    }
    if (change_latitude2 < 16) {
        change_latitude2 = '0' + change_latitude2.toString(16);
    } else {
        change_latitude2 = change_latitude2.toString(16);
    }
    if (change_longitude1 < 16) {
        change_longitude1 = '0' + change_longitude1.toString(16);
    } else {
        change_longitude1 = change_longitude1.toString(16);
    }
    if (change_longitude2 < 16) {
        change_longitude2 = '0' + change_longitude2.toString(16);
    } else {
        change_longitude2 = change_longitude2.toString(16);
    }

    let p2paddr = change_latitude1 + change_latitude2 + change_longitude1 + change_longitude2;
    return p2paddr;
}

module.exports.calcP2pAddrFromIP = async function (ip) {
    let p2paddr;
    await iplocation(ip).then((res) => {
        p2paddr = calcP2pAddrFromGPS(res.latitude, res.longitude);
    });
    return p2paddr;
}

//
module.exports.makeFileName = function(kind, tag){
    if(tag == null)
    {
        return kind + config.NET_CONF_PATH.JSON;
    }

    return kind + tag + config.NET_CONF_PATH.JSON;
}
