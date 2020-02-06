const define = require('../../config/define.js');
const netutil = require('../net/netutil.js');
const logger = require('../utils/logger.js');

let ctx = new Object();
let ctxArray = new Array();
ctx.CTX = ctxArray;
let ctx_count = 0;

let hwInfo = new Array();

let ctx_map = new Map();

module.exports.hwInfo = function (data) {
    hwInfo.push(data);
}

module.exports.hwInfoList = function () {
    return hwInfo;
}

module.exports.ctxList = async function (socket) {

    let overlap = false;
    overlap = await ctxOverlap(socket);
    if (netutil.ipUtil(socket, define.division.remoteIP) != netutil.ipUtil(socket, define.division.localhost) && overlap == false) {
        ctx.CTX[ctx_count] = socket;
        ctx_count++;
        logger.info(ctx);
        logger.debug(typeof (ctx));
        return ctx;
    }
    else {
        logger.warn("This is not a correct IP or overlaped IP");
        return ctx;
    }
}

module.exports.getCTXMap = () => {
    return ctx_map;
}

module.exports.getSocketCTX = async (remoteAddress) => {
    return ctx_map.get(remoteAddress);
}

module.exports.AddSocketCTX = async (socket) => {
    let overlap = ctx_map.get(socket.remoteAddress.slice(7));

    if(overlap === undefined && (netutil.ipUtil(socket, define.division.remoteIP) != netutil.ipUtil(socket, define.division.localhost)))
    {
        ctx_map.set(socket.remoteAddress.slice(7), socket);
    }
}

function ctxOverlap(socket) {
    if (ctx_count == 0) {
        return false;
    }
    else {
        for (var i = 0; i < ctx_count; i++) {
            if ((socket.remoteAddress).slice(7) == (ctx.CTX[i]._peername.address).slice(7)) {
                return true;
            }
            else {
                return false;
            }
        }
    }
}