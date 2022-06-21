//
const define = require('./../../config/define.js');
const netUtil = require('./../net/netUtil.js');
const logger = require('./../utils/winlog.js');

//
let ctx = new Object();
let ctxArray = new Array();
ctx.CTX = ctxArray;
let ctx_count = 0;

let ctx_map = new Map();

//
module.exports.ctxList = async function (socket) {

    let overlap = false;
    overlap = await ctxOverlap(socket);
    if (netUtil.ipUtil(socket, define.DIVISION.remoteIP) !== netUtil.ipUtil(socket, define.DIVISION.localhost) && overlap === false) {
        ctx.CTX[ctx_count] = socket;
        ctx_count++;
        logger.debug(ctx);
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

    if(overlap === undefined && (netUtil.ipUtil(socket, define.DIVISION.REMOTE_IP) !== netUtil.ipUtil(socket, define.DIVISION.LOCALHOST)))
    {
        ctx_map.set(socket.remoteAddress.slice(7), socket);
    }
}

module.exports.DelSocketCTX = async (remoteAddress) => {
    await ctx_map.delete(remoteAddress);
}

function ctxOverlap(socket) {
    if (!ctx_count) {
        return false;
    }
    else {
        for (var i = 0; i < ctx_count; i++) {
            if ((socket.remoteAddress).slice(7) === (ctx.CTX[i]._peername.address).slice(7)) {
                return true;
            }
            else {
                return false;
            }
        }
    }
}