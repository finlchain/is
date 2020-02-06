const config = require('../../config/config.js');
const define = require('../../config/define.js');
const dbutil = require('../db/dbutil.js');
const iplocation = require('iplocation').default;
const distance = require('gps-distance');

module.exports.socketWrite = function(socket, data){
    // let msg = data + "\r";
    let msg = data + "\f";
    let result = socket.write(msg);
    // if(!result) this.socketWrite(socket, data);
}

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

module.exports.likeHex = function(data){
    return '0x'+data;
}

module.exports.makeFileName = function(kind, tag){
    if(tag == null)
        return kind + config.netconfpath.json;
    return kind + tag + config.netconfpath.json;
}

module.exports.ipUtil = async (socket, division) => {
    if (division == define.division.localhost) {
        var localhost = define.ip.localhost;
        return (localhost);
    }
    else if (division == define.division.remoteIP) {
        var remote_ip = (socket.remoteAddress).slice(7);
        return (remote_ip);
    }
    else if (division == define.division.localIP) {
        var local_ip = (socket.localAddress).slice(7);
        return (local_ip);
    }
    else if (division == define.division.localPort) {
        var local_port = socket.localPort;
        return (local_port);
    }
    else if (division == define.division.remotePort) {
        var remote_port = socket.remotePort;
        return (remote_port);
    }
    else if (division == define.division.empIP) {
        var ip = define.ip.empty;
        return (ip);
    }
    else if (division == define.division.empPort) {
        var port = 0;
        return (port);
    }
}

module.exports.setList = async (asign) => {
    let topic = {};
    let p2p = {};
    let list = new Array();
    let p2p_addr_list = new Array();
    let set_asign = JSON.parse(JSON.stringify(asign));
    for (var i = 0; i < set_asign.p2p_addr.length; i++) {
        p2p_addr_list.push((set_asign.p2p_addr[i]).slice(0, 14));
        p2p_addr_list = Array.from(new Set(p2p_addr_list));
    }

    for (var i = 0; i < p2p_addr_list.length; i++) {
        for (var j = 0; j < set_asign.p2p_addr.length; j++) {
            if (p2p_addr_list[i] == (set_asign.p2p_addr[j]).slice(0, 14)) {
                p2p[define.db.idx] = set_asign.idx[j];
                p2p[define.db.totalPrr] = set_asign.total_prr[j];
                p2p[define.db.ip] = set_asign.ip[j];
                list.push(p2p);
                p2p = {};
            }
        }
        list.sort(function (a, b) {
            if (a.total_prr == b.total_prr) {
                return a.idx < b.idx ? -1 : a.idx > b.idx ? 1 : 0;
            }
            else {
                return a.total_prr > b.total_prr ? -1 : a.total_prr < b.total_prr ? 1 : 0;
            }
        });
        topic[p2p_addr_list[i]] = list;
        list = [];
    }
    return topic;
}

module.exports.p2paddr = async function (ip) {
    let p2paddr;
    await iplocation(ip).then((res) => {
        p2paddr = calc_p2p(res.latitude, res.longitude);
    });
    return p2paddr;
}

module.exports.topicName = async function (p2paddr) {
    let topic;
    let idcInfo = await JSON.parse(await dbutil.query(dbutil.idc_info.querys.total_idc_list));

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
    let designatedIDC = await JSON.parse(await dbutil.queryPre(dbutil.idc_info.querys.designated_idc, [min[0].Name]));
    let base_p2p = calc_p2p(parseFloat(designatedIDC.latitude[0]), parseFloat(designatedIDC.longitude[0]));
    topic = base_p2p + (parseInt(designatedIDC.idc_code[0]) + 0x1000).toString(16).substr(-3).toUpperCase() + '0';
    return topic;
}

module.exports.makeISAContract = async (data) => {
    return 'contract'+JSON.stringify(data);
}

module.exports.nearestIDC = async (ip) => {
    let idc_gps = await JSON.parse(await dbutil.query(dbutil.idc_info.querys.designated_idc2));
    let distance_arr = new Array();
    let choice_idc = -1;
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
            if (choice_idc == -1) choice_idc = 0;
            return idc_gps.hub_code[choice_idc];
        })
        .catch(err => {
            logger.warn("Invalid CLI's IP Address");
        })
    return idc_hub_code;
}

function calc_p2p(latitude, longitude) {
    let change_latitude1 = Math.floor(latitude);
    let change_latitude2 = Math.floor((latitude - change_latitude1).toPrecision(3) * 100);
    let change_longitude1 = Math.floor(longitude);
    let change_longitude2 = Math.floor((longitude - change_longitude1).toPrecision(3) * 100);
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