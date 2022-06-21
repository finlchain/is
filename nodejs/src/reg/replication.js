//
const config = require('./../../config/config.js');
const define = require('./../../config/define.js');
const cliHandler = require('./../cli/cliHandler.js');
const dbUtil = require('./../db/dbUtil.js');
const dbIS = require('./../db/dbIS.js');
const dbRepl = require("./../db/dbRepl.js");
const netUtil = require('./../net/netUtil.js');
const netConf = require('./../net/netConf.js');
const netSend = require('./../net/netSend.js');
const util = require('./../utils/commonUtil.js');
const logger = require('./../utils/winlog.js');

// Replication Reset
module.exports.resetReplData = async () => {
    logger.debug("func : resetReplData");

    await dbUtil.query(dbIS.querys.is.truncateIsReplInfo);
}

// Replication Get
module.exports.getReplData = async (blkNum, role, clusterP2pAddr) => {
    logger.debug("func : getReplData");

    let query_result;

    //
    if (typeof blkNum === 'undefined')
    {
        query_result = await dbUtil.query(dbIS.querys.is.repl_info.selectReplInfo);
    }
    else if (typeof role === 'undefined')
    {
        let maxBlkNum;

        let query_result_1 = await dbUtil.queryPre(dbIS.querys.is.repl_info.selectMaxReplInfoByBN, [blkNum]);
        if (query_result_1.length)
        {
            maxBlkNum = query_result_1[0].max_blk_num;
            logger.debug("maxBlkNum : " + maxBlkNum);
    
            query_result = await dbUtil.queryPre(dbIS.querys.is.repl_info.selectReplInfoByBN, [maxBlkNum]);
        }
    }
    else if (typeof clusterP2pAddr === 'undefined')
    {
        let maxBlkNum;

        let query_result_1 = await dbUtil.queryPre(dbIS.querys.is.repl_info.selectMaxReplInfoByBNAndRole, [blkNum, role]);
        if (query_result_1.length)
        {
            maxBlkNum = query_result_1[0].max_blk_num;
            logger.debug("maxBlkNum : " + maxBlkNum);
            
            query_result = await dbUtil.queryPre(dbIS.querys.is.repl_info.selectReplInfoByBNAndRole, [maxBlkNum, role]);
        }
    }
    else
    {
        let maxBlkNum;

        let query_result_1 = await dbUtil.queryPre(dbIS.querys.is.repl_info.selectMaxReplInfoByBNAndRole, [blkNum, role]);
        if (query_result_1.length)
        {
            maxBlkNum = query_result_1[0].max_blk_num;
            logger.debug("maxBlkNum : " + maxBlkNum);
    
            query_result = await dbUtil.queryPre(dbIS.querys.is.repl_info.selectReplInfoByBNAndRoleAndClusterP2pAddr, [maxBlkNum, role, clusterP2pAddr]);
        }
    }
    
    //
    if (!query_result.length)
    {
        logger.error("Error - getReplData");
    }

    return query_result;
}

// Replication Set Mine
module.exports.saveReplMyData = async(lastBlk) => {
    logger.debug("func : saveReplMyData");

    // let serverId = util.strToInt(define.P2P_DEFINE.P2P_SUBNET_ID_IS);
    let serverId = util.ipToInt(util.getMyReplIP().toString());

    let res = await dbRepl.setReplMaster(serverId);

    await dbUtil.queryPre(dbIS.querys.is.repl_info.insertReplInfo, [define.P2P_DEFINE.P2P_SUBNET_ID_IS, lastBlk, util.getMyReplIP(), define.NODE_ROLE.NUM.IS, res.fileName, res.filePosition, define.P2P_DEFINE.P2P_CLUSTER_ID_IS]);
}

// Replication Set 1
module.exports.saveReplData = async(socket, jsonData) => {
    logger.debug("func : saveReplData");

    let remoteIpStr = ((socket.remoteAddress).slice(7)).toString();

    // let replData = jsonData.ip + " " + define.NODE_ROLE.STR.NN + " " + jsonData.data;
    // logger.debug("replData : " + replData);

    let clusterInfo = await dbUtil.queryPre(dbIS.querys.is.cluster_info.selectClusterInfoByIp, [remoteIpStr]);

    if (clusterInfo.length && (clusterInfo[0].role !== null))
    {
        let splitData = jsonData.data.split(" ");
        let logFile = splitData[0];
        let logPos = splitData[1];
        // 
        await dbUtil.queryPre(dbIS.querys.is.repl_info.insertReplInfo, [define.P2P_DEFINE.P2P_SUBNET_ID_IS, netConf.getLastBlkNum(), jsonData.ip, clusterInfo[0].role, logFile, logPos, clusterInfo[0].cluster_p2p_addr]);
    }
}

module.exports.getReplDataArr = async (blkNum, role, clusterP2pAddr) => {
    let replDataArr = new Array();

    let replData = await this.getReplData(blkNum, role, clusterP2pAddr);

    if (replData.length)
    {
        for(var i = 0; i < replData.length; i++)
        {
            // 
            // replDataArr.push({data : replData[i].repl_data});
            // blk_num, ip, role, log_file, log_pos, cluster_p2p_addr
            replDataArr.push({blk_num : replData[i].blk_num, ip : replData[i].ip, role : replData[i].role, 
                    log_file : replData[i].log_file, log_pos : replData[i].log_pos, cluster_p2p_addr : replData[i].cluster_p2p_addr});
        }
    }
    else
    {
        logger.error("Error - getReplDataArr : No replDataArr");
    }

    return replDataArr;
}

// Replication Set 1
module.exports.setReplNN = async (map, blkNum) => {
    logger.debug("func : setReplNN");

    // Replication Data of NNs
    let replDataArr = await this.getReplDataArr(blkNum, define.NODE_ROLE.NUM.NN);
    if (replDataArr.length)
    {
        netSend.writeSome(map, define.CMD.req_db_repl_set, replDataArr, dbIS.querys.is.node_cons_info.selectNodeConsInfoByRole, define.NODE_ROLE.NUM.NN);
    }
}

module.exports.setReplISAg = async (map, blkNum) => {
    logger.debug("func : setReplISAg");

    let isgNodeInfoList = await dbUtil.queryPre(dbIS.querys.is.node_cons_info.selectNodeConsInfoByRole, [define.NODE_ROLE.NUM.ISAG]);

    if (isgNodeInfoList.length && isgNodeInfoList[0].p2p_addr !== null)
    {
        for (let idx=0; idx<isgNodeInfoList.length; idx++)
        {
            let isgNodeInfo = isgNodeInfoList[idx];

            logger.debug("isgNodeInfo2.ip : " + isgNodeInfo.ip + "isgNodeInfo2.p2p_addr : " + isgNodeInfo.p2p_addr);

            //
            let replDataArrP2pNN = await this.getReplDataArr(blkNum, define.NODE_ROLE.NUM.NN, isgNodeInfo.p2p_addr.slice(0, 14));
            let replDataArrNN = await this.getReplDataArr(blkNum, define.NODE_ROLE.NUM.NN);
            let replDataArrIS = await this.getReplDataArr(blkNum, define.NODE_ROLE.NUM.IS);

            let sendData = {
                data1:replDataArrIS,
                data2:replDataArrNN,
                data3:isgNodeInfo.p2p_addr,
                data4:replDataArrP2pNN[0].blk_num
            }

            await util.asyncForEach(replDataArrNN, async (replData, index) => {
                let replBlkNum = replData.blk_num;
                let ip =  replData.ip;
                let role =  replData.role;
                let logFile = replData.log_file;
                let logPos = replData.log_pos;

                logger.info("ip : " + ip + ", logFile : " + logFile + ", logPos : " + logPos + ", role : " + role + ", replBlkNum : " + replBlkNum);
            });

            if (replDataArrIS.length && replDataArrNN.length)
            {
                netUtil.sendNetCmd(map.get(netUtil.inet_ntoa(isgNodeInfo.ip)), define.CMD.req_db_repl_set, sendData);
            }
        }
    }
}

module.exports.setReplISAg2 = async (map, blkNum) => {
    logger.debug("func : setReplISAg");

    let isgNodeInfoList = await dbUtil.queryPre(dbIS.querys.is.node_cons_info.selectNodeConsInfoByRole, [define.NODE_ROLE.NUM.ISAG]);

    if (isgNodeInfoList.length && isgNodeInfoList[0].p2p_addr !== null)
    {
        for (let idx=0; idx<isgNodeInfoList.length; idx++)
        {
            let isgNodeInfo = isgNodeInfoList[idx];

            logger.debug("isgNodeInfo2.ip : " + isgNodeInfo.ip + "isgNodeInfo2.p2p_addr : " + isgNodeInfo.p2p_addr);

            // // Replication Data of NN with specific p2p address
            // let replDataArrNN = await this.getReplDataArr(blkNum, define.NODE_ROLE.NUM.NN);
            // let replDataArrIS = await this.getReplDataArr(blkNum, define.NODE_ROLE.NUM.IS);

            // //
            // let replDataArr = new Array();
            // replDataArr.push(replDataArrNN[0]);
            // replDataArr.push(replDataArrIS[0]);

            let replDataArrNN = await this.getReplDataArr(blkNum, define.NODE_ROLE.NUM.NN);
            let replDataArrIS = await this.getReplDataArr(blkNum, define.NODE_ROLE.NUM.IS);

            //
            let replDataArr = new Array();

            replDataArr.push(replDataArrIS[0]);

            await util.asyncForEach(replDataArrNN, async (replData, index) => {
                replDataArr.push(replData);
            });

            await util.asyncForEach(replDataArr, async (replData, index) => {
                let replBlkNum = replData.blk_num;
                let ip =  replData.ip;
                let role =  replData.role;
                let logFile = replData.log_file;
                let logPos = replData.log_pos;

                logger.info("ip : " + ip + ", logFile : " + logFile + ", logPos : " + logPos + ", role : " + role + ", replBlkNum : " + replBlkNum);
            });

            if (replDataArr.length)
            {
                netUtil.sendNetCmd(map.get(netUtil.inet_ntoa(isgNodeInfo.ip)), define.CMD.req_db_repl_set, replDataArr);
            }
        }
    }
}

module.exports.setReplISAgBackUp = async (map, blkNum) => {
    logger.debug("func : setReplISAg");

    let isgNodeInfoList = await dbUtil.queryPre(dbIS.querys.is.node_cons_info.selectNodeConsInfoByRole, [define.NODE_ROLE.NUM.ISAG]);

    if (isgNodeInfoList.length && isgNodeInfoList[0].p2p_addr !== null)
    {
        for (let idx=0; idx<isgNodeInfoList.length; idx++)
        {
            let isgNodeInfo = isgNodeInfoList[idx];

            logger.debug("isgNodeInfo.ip : " + isgNodeInfo.ip + "isgNodeInfo.p2p_addr : " + isgNodeInfo.p2p_addr);

            // Replication Data of NN with specific p2p address
            let replDataArrNN = await this.getReplDataArr(blkNum, define.NODE_ROLE.NUM.NN, isgNodeInfo.p2p_addr.slice(0, 14));
            let replDataArrIS = await this.getReplDataArr(blkNum, define.NODE_ROLE.NUM.IS);

            //
            let replDataArr = new Array();
            replDataArr.push(replDataArrIS[0]);
            replDataArr.push(replDataArrNN[0]);
            
            await util.asyncForEach(replDataArr, async (replData, index) => {
                let replBlkNum = replData.blk_num;
                let ip =  replData.ip;
                let role =  replData.role;
                let logFile = replData.log_file;
                let logPos = replData.log_pos;

                logger.info("ip : " + ip + ", logFile : " + logFile + ", logPos : " + logPos + ", role : " + role + ", replBlkNum : " + replBlkNum);
            });

            if (replDataArr.length)
            {
                netUtil.sendNetCmd(map.get(netUtil.inet_ntoa(isgNodeInfo.ip)), define.CMD.req_db_repl_set, replDataArr);
            }
        }
    }
}
