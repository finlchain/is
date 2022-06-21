//
const net = require('net');

//
const config = require('./../../config/config.js');
const define = require('./../../config/define.js');
const logger = require('./../utils/winlog.js');
const dataHandler = require('./../net/dataHandler.js');
const ctx = require('./../net/ctx.js');
const netUtil = require('./../net/netUtil.js');
const dbUtil = require('./../db/dbUtil.js');
const dbIS = require('./../db/dbIS.js');

//
const stopRes = false;
let isag_socket = 0;

//
const deleteDbTableISA = async (closeIP) => {
    if (dataHandler.getBlockGenStatus())
    {
        await dataHandler.stopBlockGen(stopRes);
    }
    else
    {
        logger.info("[TCP] [ISA] Disconnected ISA : " + closeIP);

        await dbUtil.queryPre(dbIS.querys.is.node_cons_info.deleteNodeConsInfoByIp, [closeIP]);
        logger.info("[TCP] [ISA] Delete node_cons_info Success");

        await dbUtil.queryPre(dbIS.querys.is.node_hw_info.deleteNodeHwInfoByIp, [closeIP]);
        logger.info("[TCP] [ISA] Delete node_hw_info Success");

        await ctx.DelSocketCTX(closeIP);
    }
}

const deleteDbTableISAg = async (closeIP) => {
    if (dataHandler.getBlockGenStatus())
    {
        await dataHandler.stopBlockGen(stopRes);
    }
    else
    {
        logger.info("[TCP] [ISAg] Disconnected ISAg : " + closeIP);

        await dbUtil.queryPre(dbIS.querys.is.node_cons_info.deleteNodeConsInfoByIp, [closeIP]);
        logger.info("[TCP] [ISAg] Delete node_cons_info Success");

        await dbUtil.queryPre(dbIS.querys.is.node_hw_info.deleteNodeHwInfoByIp, [closeIP]);
        logger.info("[TCP] [ISAg] Delete node_hw_info Success");

        await ctx.DelSocketCTX(closeIP);
    }
}

// ISA TCP Server
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
            await dataHandler.handler(data, isa);
        });

        isa.on('end', async function () {
            logger.info("[TCP] [ISA] Client disconnected");
            is.getConnections(function (err, count) {
                logger.info("[TCP] [ISA] Remaining Connections : " + count);
            });

            await deleteDbTableISA(isa._peername.address.slice(7));
        });
        
        isa.on('error', async function (err) {
            logger.error("[TCP] [ISA] Socket Error : " + JSON.stringify(err));

            await deleteDbTableISA(isa._peername.address.slice(7));
        });

        isa.setNoDelay(true);

        isa.on('timeout', function () {
            logger.warn("[TCP] [ISA] Socket Timed out");
        });
    });

    is.listen(config.SOCKET_INFO.BIND_ISA_SERVER_PORT, async function () {
        logger.info("[TCP] [ISA] Server listening : " + JSON.stringify(is.address()));
        is.on('close', function () {
            logger.info('[TCP] [ISA] Server Terminated');
        });
        is.on('error', function (err) {
            logger.error('[TCP] [ISA] Server Error : ', JSON.stringify(err));
        });
    });
}

// ISAg TCP Server
module.exports.bindISAgServer = async function(){
    let is = net.createServer(async function (isa0) {
        if(!isag_socket){
            isag = isa0;
            isag_socket = 1;
        }
        await ctx.AddSocketCTX(isa0);
        let ctx_list = ctx.getCTXMap();
        // logger.debug("network count : %d", ctx_List.CTX.length);
        is.getConnections(function (err, count) {
            logger.info("[TCP] [ISAg] Network Counts : " + count);
        });
        
        isa0.setEncoding('utf8');

        isa0.on('data', async function (data) {
            logger.debug('[TCP] [ISAg] [RECV] ' + data);
            await dataHandler.handler(data, isa0);
        });

        isa0.on('end', async function () {
            logger.info("[TCP] [ISAg] Client disconnected");
            is.getConnections(function (err, count) {
                logger.info("[TCP] [ISAg] Remaining Connections : " + count);
            });

            await deleteDbTableISAg(isa0._peername.address.slice(7));
        });

        isa0.on('error', async function (err) {
            logger.error("[TCP] [ISAg] Socket Error : " + JSON.stringify(err));

            await deleteDbTableISAg(isa0._peername.address.slice(7));
        });

        isa0.setNoDelay(true);

        isa0.on('timeout', function () {
            logger.warn("[TCP] [ISAg] Socket Timed out");
        });
    });

    is.listen(config.SOCKET_INFO.BIND_ISAG_SERVER_PORT, async function () {
        logger.info("[TCP] [ISAg] Server listening : " + JSON.stringify(is.address()));
        is.on('close', function () {
            logger.info('[TCP] [ISAg] Server Terminated');
        });
        is.on('error', function (err) {
            logger.error('[TCP] [ISAg] Server Error : ', JSON.stringify(err));
        });
    });
}
