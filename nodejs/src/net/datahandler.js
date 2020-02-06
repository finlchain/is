const config = require('../../config/config.js');
const define = require('../../config/define.js');
const dbutil = require('../db/dbutil.js');
const netutil = require('../net/netutil.js');
const prr = require('../reg/prr.js');
const ctx = require('../net/ctx.js');
const timer = require('../utils/timer.js');
const common = require('../utils/common.js');
const logger = require('../utils/logger.js');
const handleDefine = require('../../config/define.js').dataHandler;

module.exports.handler = async (data, socket) => {
    let map = ctx.getCTXMap();
    
    if(await common.CheckJson(data)){
        let jsonData = JSON.parse(data);
        // 1. push data in HWInfo Array
        if(jsonData.HWInfo != null){
            await prr.calculatePrr(jsonData, socket);
            await ctx.hwInfo(data);
            let node_count = await JSON.parse(await dbutil.query(dbutil.node_info.querys.node_count));
        }
        // 2. update status when start node
        else if(jsonData.status != null){
            if(jsonData.status == handleDefine.start){
                await dbutil.queryPre(dbutil.node_info.querys.state_update_start, [jsonData.ip]);
                logger.info("[TCP] [ISA] [RECV] " + jsonData.role + " start success : " + jsonData.ip);
            }
            else if (jsonData.status == handleDefine.stop) {
                await dbutil.queryPre(dbutil.node_info.querys.state_update_stop, [jsonData.ip]);
                logger.info("[TCP] [ISA] [RECV] " + jsonData.role + " stop success : " + jsonData.ip);
            }
            else if (jsonData.status == handleDefine.res_success) {
                if (jsonData.kind == handleDefine.status_stop){
                    let ip_p2p_addr = await JSON.parse(await dbutil.queryPre(dbutil.node_info.querys.cluster, [jsonData.ip]));
                    let p2pAddrForState = ip_p2p_addr.p2p_addr[0].slice(0,14)+'%';
                    await dbutil.queryPre(dbutil.node_info.querys.state_update_stop_cluster, [p2pAddrForState]);
                }
                else if (jsonData.kind == handleDefine.blk_start_kind) {
                    // start reward scheduler
                    await timer.setRewardScheduler();
                }
                else if (jsonData.kind == handleDefine.blk_stop_kind) {
                    // stop reward scheduler
                    await timer.delRewardScheduler();
                }
                else if (jsonData.kind == handleDefine.reward_complete) {
                    let nn_list = await JSON.parse(await dbutil.queryPre(dbutil.node_info.querys.reward_list, [jsonData.ip]));
                    if(nn_list != null) {
                        for (var i = 0; i < nn_list.ip.length; i++) {
                            await netutil.socketWrite(map.get(netutil.inet_ntoa(nn_list.ip[i])), handleDefine.reward_complete_spread);
                        }
                    }
                }
                logger.info("[TCP] [ISA] [RECV] " + jsonData.kind + " " + jsonData.status + " : " + jsonData.ip);
            }
            else{
                logger.warn("[TCP] [ISA] [RECV] Invalid res format  : " + jsonData.ip);
                console.log(jsonData);
            }
        }
        // 3. contract : add user, change id, change pubkey
        else if (jsonData.Note[0].Kind == handleDefine.add_user || jsonData.Note[0].Kind == handleDefine.change_id || jsonData.Note[0].Kind == handleDefine.change_pubkey){
            let sca0ip_info = await JSON.parse(await dbutil.queryPre(dbutil.node_info.querys.sca0_ip_info, [config.netConfSet.maxCluster]));
            let sca0ip = netutil.inet_ntoa(sca0ip_info.ip[0]);
            let toISAData = await netutil.makeISAContract(jsonData);
            await netutil.socketWrite(map.get(sca0ip), toISAData);
            socket.write(define.strReturn.true);
            logger.info("[TCP] [ISA0] [SEND] Contract Send To SCA0 : "+sca0ip);
        }
        // 4. contract : login user
        else if(jsonData.Note[0].Kind == handleDefine.login){
            let cli_ip = jsonData.Note[0].Content.IP;
            let nearest_idc = await netutil.nearestIDC(cli_ip);
            let nearest_nodes = await JSON.parse(await dbutil.queryPre(dbutil.node_info.querys.nn_idc_info, [nearest_idc]));
            let randomNN = nearest_nodes.ip[Math.floor(Math.random() * nearest_nodes.ip.length)];
            let scaRanIP = netutil.inet_ntoa(randomNN);
            let toISAData = await netutil.makeISAContract(jsonData);
            await netutil.socketWrite(map.get(scaRanIP), toISAData);
            socket.write(define.strReturn.true);
            logger.info("[TCP] [ISA0] [SEND] Contract(login user) Send To Nearest SCA : "+scaRanIP);
        }
    }
    else if (data.slice(handleDefine.repl_arg_start, handleDefine.repl_arg_end) == handleDefine.repl_set) {
        await replSet(data, map);
    }
    else logger.warn("[TCP] [RECV] "+ data+" is Invalid format");
}

async function replSet(data, map){
    let splitdata = data.split(" ");
    if(splitdata[2]!=undefined && splitdata[3]!=undefined && splitdata[4]!=undefined){
        let clustercode = await JSON.parse(await dbutil.queryPre(dbutil.node_info.querys.cluster, [splitdata[2]]));
        // dn(cn)is 
        let dn_ip_info = await JSON.parse(await dbutil.queryPre(dbutil.node_info.querys.dn_ip_info, [clustercode.p2p_addr[0].slice(0, 14)+"%"]));
        for (var i = 0; i < dn_ip_info.ip.length; i++) {
            let returnData = splitdata[0] + " " + splitdata[1] + " " + splitdata[2] + " " + define.nodeKind.dn + " " + splitdata[3] + " " + splitdata[4] + " " + clustercode.p2p_addr[0].slice(2);
            await netutil.socketWrite(map.get(netutil.inet_ntoa(dn_ip_info.ip[i])), returnData);
        }
        // dbn
        let dbn_ip_info = await JSON.parse(await dbutil.queryPre(dbutil.node_info.querys.dbn_ip_info, [clustercode.p2p_addr[0].slice(0, 14) + "%"]));
        for (var i = 0; i < dbn_ip_info.ip.length; i++) {
            let returnData = splitdata[0] + " " + splitdata[1] + " " + splitdata[2] + " " + define.nodeKind.dbn + " " + splitdata[3] + " " + splitdata[4] + " " + clustercode.p2p_addr[0].slice(2);
            await netutil.socketWrite(map.get(netutil.inet_ntoa(dbn_ip_info.ip[i])), returnData);
        }
    }
    else{
        logger.warn("[TCP] [ISA0] [RECV] " + data+ " is Invalid replication set format");
    }
}