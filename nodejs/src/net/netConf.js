//
const fs = require('fs');

//
const config = require('./../../config/config.js');
const define = require('./../../config/define.js');
const dbUtil = require('./../db/dbUtil.js');
const dbIS = require('./../db/dbIS.js');
const netUtil = require('./../net/netUtil.js');
const netConf = require('./../net/netConf.js');
const repl = require('./../reg/replication.js');
const util = require('./../utils/commonUtil.js');
const logger = require('./../utils/winlog.js');

//
let lastBlkNum = 0;

//
module.exports.getLastBlkNum = () => {
    return lastBlkNum;
}

module.exports.setLastBlkNum = (blkNum) => {
    lastBlkNum = BigInt(blkNum);
}

const rrNetJsonMaker = async function(list){
    let rr_net = new Object();
    let net = new Object();
    let net_tier_array = new Array();
    let net_tier = new Object();
    let sock = new Object();
    let nn_list = new Object();
    let nn_list_array = new Array();

    //for test
    let revision = await dbUtil.query(dbIS.querys.is.revision.selectRevisonCount);

    for (var i = 0; i < list.length; i++) {
        sock.PROTO = 1;
        sock.IP = netUtil.inet_ntoa(list[i].ip);
        sock.PORT = config.SOCKET_INFO.RR_NET_PORT;
        nn_list.P2P = list[i].p2p_addr;
        nn_list.SOCK = sock;
        nn_list_array.push(nn_list);
        sock = {};
        nn_list = {};
    }
    
    net_tier.GEN_INTERVAL = config.NET_CONF_SET.GEN_INTERVAL;
    net_tier.GEN_SUB_INTRVL = config.NET_CONF_SET.GEN_SUB_INTRVL;
    net_tier.GEN_ROUND_CNT = config.NET_CONF_SET.GEN_ROUND_CNT;
    net_tier.START_TIME = String(Math.floor(+ new Date()));

    //for test
    let startBlkNum = BigInt(lastBlkNum) + BigInt(1);
    net_tier.START_BLOCK = BigInt(startBlkNum).toString();
    net_tier.TOTAL_NN = list.length;

    // 
    net_tier.NN_LIST = nn_list_array;
    net_tier_array.push(net_tier);

    // 
    net.REVISION = parseInt(revision[0].count);
    net.TIER_NUM = config.NET_CONF_SET.TIER_NUM;
    net.TIER = net_tier_array;
    rr_net.NET = net;

    return rr_net;
}

const nodeJsonMaker = async function(kind, list, count, rrNet){
    let nodejson = new Object();
    let node = new Object(); // NODE
    let p2p = new Object();
    let cluster = new Object();
    let sock = new Object();
    let num = new Object(); // NODE : SOCK : NUM
    let tcp_svr_1 = new Object();
    let tcp_cli_1 = new Object();
    let peers = new Array();

    if(kind === define.NODE_ROLE.STR.NN)
    {
        // // NODE : TYPE
        // node.TYPE = define.NODE_ROLE.STR.RN;

        // NODE : RULE
        node.RULE = define.NODE_ROLE.STR.NN;
        
        // NODE : P2P : CLUSTER
        cluster.ROOT = list[count].p2p_addr;

        let nn_cnt = 0;
        for (var i = 0; i < list.length; i++)
        {
            if (list[i].role === define.NODE_ROLE.NUM.NN)
            {
                if(netUtil.inet_ntoa(list[count].ip) === netUtil.inet_ntoa(list[i].ip))
                {
                    cluster.ADDR = util.appendHexPrefix((list[i].p2p_addr).slice(14));
                }
                
                nn_cnt++;
            }
        }

        cluster.MAX = config.NET_CONF_SET.CLUSTER_MAX;
        p2p.CLUSTER = cluster;
        node.P2P = p2p;

        // NODE : SOCK : NUM
        num.UDP_SVR = config.NET_CONF_SET.UDP_SVR;
        num.UDP_CLI = config.NET_CONF_SET.UDP_CLI;
        num.TCP_SVR = config.NET_CONF_SET.TCP_SVR_NN;
        if(nn_cnt === 1)
        {
            num.TCP_CLI = config.NET_CONF_SET.TCP_CLI_0;
        }
        else if(nn_cnt > 1)
        {
            num.TCP_CLI = config.NET_CONF_SET.TCP_CLI;
        }
        else
        {
            // Error
        }

        sock.NUM =num;

        // NODE : SOCK : TCP_SRV_1
        tcp_svr_1.IP = netUtil.inet_ntoa(list[count].ip);
        tcp_svr_1.PORT = config.SOCKET_INFO.RR_NET_PORT;
        if (rrNet.NET.TIER[config.NET_CONF_SET.TIER_NUM - 1].NN_LIST.length === 1)
        {
            tcp_svr_1.TOTAL_PEERS = define.DEFAULT_NET_CONF.TCP_SVR_1_TOTAL_PEERS_CONS_1;
        }
        else
        {
            tcp_svr_1.TOTAL_PEERS = define.DEFAULT_NET_CONF.TCP_SVR_1_TOTAL_PEERS;
        }

        if (rrNet.NET.TIER[config.NET_CONF_SET.TIER_NUM - 1].NN_LIST.length > 1)
         {
            let next_rr_idx = (rrNet.NET.TIER[0].NN_LIST.map(function (e) { return e.P2P; }).indexOf(list[count].p2p_addr) -1);
            if (next_rr_idx === -1)
            {
                next_rr_idx = rrNet.NET.TIER[0].NN_LIST.length-1;
            }

            peers2 = {
                IP: rrNet.NET.TIER[config.NET_CONF_SET.TIER_NUM - 1].NN_LIST[next_rr_idx].SOCK.IP,
                PORT: config.SOCKET_INFO.RR_NET_SRC_PORT
            };
            peers.push(peers2);
        }
        tcp_svr_1.PEERS = peers;
        peers = [];
        sock.TCP_SVR_1 = tcp_svr_1;

        // NODE : SOCK : TCP_CLI_1
        tcp_cli_1.AUTO_JOIN = config.NET_CONF_SET.AUTO_JOIN_NN;
        tcp_cli_1.P2P_JOIN = config.NET_CONF_SET.P2P_JOIN_NN;

        if(rrNet.NET.TIER[config.NET_CONF_SET.TIER_NUM-1].NN_LIST.length > 1)
        {
            let next_rr_idx = (rrNet.NET.TIER[0].NN_LIST.map(function (e) { return e.P2P; }).indexOf(list[count].p2p_addr) + 1) % rrNet.NET.TIER[0].NN_LIST.length;
            let tcp_cli_peer = {
                IP: rrNet.NET.TIER[config.NET_CONF_SET.TIER_NUM - 1].NN_LIST[next_rr_idx].SOCK.IP,
                PORT: rrNet.NET.TIER[config.NET_CONF_SET.TIER_NUM - 1].NN_LIST[next_rr_idx].SOCK.PORT
            };
            let tcp_cli_local = {
                IP: netUtil.inet_ntoa(list[count].ip),
                PORT: config.SOCKET_INFO.RR_NET_SRC_PORT
            };
            tcp_cli_1.PEER = tcp_cli_peer;
            tcp_cli_1.LOCAL = tcp_cli_local;
        }

        sock.TCP_CLI_1 = tcp_cli_1;
        node.SOCK = sock;
    }
    else
    {
        // Error
    }

    nodejson.NODE = node;
    return(nodejson);
}

module.exports.makeNetConf = async (count) => {
    logger.debug("func : makeNetConf");
    let nnList = await dbUtil.queryPre(dbIS.querys.is.node_cons_info.selectNodeConsInfoByRole, [define.NODE_ROLE.NUM.NN]);
    if (nnList.length)
    {
        // rr_net.json
        let rrNetJson = JSON.stringify(await rrNetJsonMaker(nnList), null, 4);
        logger.debug("rrNetJson : " + rrNetJson);
        fs.writeFileSync(netUtil.makeFileName(config.NET_CONF_PATH.RR_NET, null), rrNetJson);

        // 
        for(var i = 0; i < nnList.length; i++)
        {
            var idx = "" + nnList[i].idx;

            if(nnList[i].role === define.NODE_ROLE.NUM.NN)
            {
                // node.json
                let nnNodeJson = JSON.stringify(await nodeJsonMaker(define.NODE_ROLE.STR.NN, nnList, i, JSON.parse(rrNetJson)), null, 4);
                logger.debug("nnNodeJson : " + nnNodeJson);
                fs.writeFileSync(netUtil.makeFileName(config.NET_CONF_PATH.NODE_NN, idx), nnNodeJson);
            }
        }

        await dbUtil.queryPre(dbIS.querys.is.revision.insertRevision, [define.P2P_DEFINE.P2P_SUBNET_ID_IS, await util.timeStampMS(), JSON.stringify(rrNetJson)]);

        return true;
    }
    else
    {
        logger.error("Error - No Data from node_cons_info table");

        return false;
    }
}
