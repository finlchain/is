const config = require('../../config/config.js');
const define = require('../../config/define.js');
const logger = require('../utils/logger.js');
const datahandler = require('../net/datahandler.js');
const cmdhandler = require('../cli/cmdhandler.js');
const ctx = require('../net/ctx.js');
const netutil = require('../net/netutil.js');
const net = require('net');

const stopRes = false;
let isag_socket = 0;
let isag;
module.exports.bindISAServer = async function(){
    let is = net.createServer(async function (isa) {
        await ctx.AddSocketCTX(isa);
        let ctx_list = ctx.getCTXMap();
        is.getConnections(function (err, count) {
            logger.info("[TCP] [ISA] Network Counts : " + count);
        });
        
        isa.setEncoding('utf8');
        isa.on('data', async function (data) {
            logger.debug('[TCP] [ISA] [RECV] ' + data);
            await datahandler.handler(data, isa);
        });
        isa.on('end', async function () {
            logger.info("[TCP] [ISA] Client disconnected");
            is.getConnections(function (err, count) {
                logger.info("[TCP] [ISA] Remaining Connections : " + count);
            });
            await stopBlockGen(stopRes);
        });
        isa.on('error', async function (err) {
            logger.err("[TCP] [ISA] Socket Error : " + JSON.stringify(err));
            await stopBlockGen(stopRes);
        });
        isa.setNoDelay(true);
        isa.on('timeout', function () {
            logger.warn("[TCP] [ISA] Socket Timed out");
        });
    });

    is.listen(config.socket.bindISAPort, async function () {
        logger.info("[TCP] [ISA] Server listening : " + JSON.stringify(is.address()));
        is.on('close', function () {
            logger.info('[TCP] [ISA] Server Terminated');
        });
        is.on('error', function (err) {
            logger.error('[TCP] [ISA] Server Error : ', JSON.stringify(err));
        });
    });
}

module.exports.bindISA0Server = async function(){
    let is = net.createServer(async function (isa0) {
        if(isag_socket == 0){
            isag = isa0;
            isage_socket = 1;
        }
        // await ctx.AddSocketCTX(isa0);
        let ctx_list = ctx.getCTXMap();
        // logger.info("network count : %d", ctx_List.CTX.length);
        is.getConnections(function (err, count) {
            logger.info("[TCP] [ISA0] Network Counts : " + count);
        });
        
        isa0.setEncoding('utf8');
        isa0.on('data', async function (data) {
            logger.debug('[TCP] [ISA0] [RECV] ' + data);
            await datahandler.handler(data, isa0);
        });
        isa0.on('end', function () {
            logger.info("[TCP] [ISA0] Client disconnected");
            is.getConnections(function (err, count) {
                logger.info("[TCP] [ISA0] Remaining Connections : " + count);
            });
        });
        isa0.on('error', function (err) {
            logger.err("[TCP] [ISA0] Socket Error : " + JSON.stringify(err));
        });
        isa0.setNoDelay(true);
        isa0.on('timeout', function () {
            logger.warn("[TCP] [ISA0] Socket Timed out");
        });
    });

    is.listen(config.socket.bindISA0Port, async function () {
        logger.info("[TCP] [ISA0] Server listening : " + JSON.stringify(is.address()));
        is.on('close', function () {
            logger.info('[TCP] [ISA0] Server Terminated');
        });
        is.on('error', function (err) {
            logger.error('[TCP] [ISA0] Server Error : ', JSON.stringify(err));
        });
    });
}

async function stopBlockGen(Res){
    Res = await cmdhandler.blockGenStop();
    if (Res) {
        logger.info("[TCP] [CLI] Block Gen Stop");
        Res = false;
    }
}

module.exports.DataToISAg = async (kind, data) => {
    await netutil.socketWrite(isag, data);
    logger.info('[TCP] [ISA0] Send '+kind);
    logger.debug('[TCP] [ISA0] [' + kind + '] ' + data);
}