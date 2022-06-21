//
const config = require('./../../config/config.js');
const define = require('./../../config/define.js');
const dbUtil = require('./../db/dbUtil.js');
const dbIS = require('./../db/dbIS.js');
const util = require('./../utils/commonUtil.js');
const logger = require('./../utils/winlog.js');

//
const gpsToP2pAddr = (latitude, longitude) => {
    //
    let fixedLatitude = util.numToFixed(latitude, define.P2P_DEFINE.P2P_GPS_DECIMAL_POINT);
    let fixedLongitude = util.numToFixed(longitude, define.P2P_DEFINE.P2P_GPS_DECIMAL_POINT);

    //
    let lat_split = fixedLatitude.split('.');
    let lon_split = fixedLongitude.split('.');

    //
    let gps_p2p_addr = '0x'
        + util.leftPadding(parseInt(lat_split[0]).toString(16), 2)
        + util.leftPadding(parseInt(lat_split[1]).toString(16), 2)
        + util.leftPadding(parseInt(lon_split[0]).toString(16), 2)
        + util.leftPadding(parseInt(lon_split[1]).toString(16), 2);

    return gps_p2p_addr;
}
module.exports.gpsToP2pAddr = gpsToP2pAddr;

// CPU_LIST
//

// HW_INFO
const setConsNode = async function (nodeInfo, socket, nodeRoleInt) {
    logger.debug("func : setConsNode");

    let result = false;

    let remoteIpStr = ((socket.remoteAddress).slice(7)).toString();

    // Insert HW Info
    await dbUtil.queryPre(
        dbIS.querys.is.node_hw_info.insertNodeHwInfo, [
            define.P2P_DEFINE.P2P_SUBNET_ID_IS, 
            remoteIpStr, //ip
            parseInt(await util.timeStampMS()), //join_time
            nodeInfo.myHwInfo.snHash, //SN_Hash
            nodeInfo.myHwInfo.network.ip.toString(), //ip list
            nodeInfo.myHwInfo.network.lanSpeed.toString(), //lanSpeed list
            nodeInfo.myHwInfo.cpu, //cpu
            nodeInfo.myHwInfo.mCalc.totalHddSize.toString(), //hdd_size
            nodeInfo.myHwInfo.storage.hdd.raid.type, //hdd_raid
            nodeInfo.myHwInfo.mCalc.totalSsdSize.toString(), //ssd_size
            nodeInfo.myHwInfo.storage.ssd.raid.type, //ssd_raid
            nodeInfo.myHwInfo.mCalc.totalNvmeSize.toString(), //nvme_size
            nodeInfo.myHwInfo.storage.nvme.raid.type, //nvme_raid
            nodeInfo.myHwInfo.mCalc.totalMemSize.toString(), //mem_size
            nodeInfo.myHwInfo.mem.speed, //mem_speed
            nodeInfo.myHwInfo.mCalc.lanChecking, //lan_check
            nodeInfo.myHwInfo.mCalc.raidChecking, //raid_check
            nodeInfo.myHwInfo.virtualChecking1, //virtual_check1
            nodeInfo.myHwInfo.virtualChecking2, //virtual_check2
            parseInt(nodeInfo.myHwInfo.mCalc.totalPrrPoint) //total_prr
        ]
    );

    // Insert Node Info
    await dbUtil.queryPre(
        dbIS.querys.is.node_cons_info.insertNodeConsInfo, [
            define.P2P_DEFINE.P2P_SUBNET_ID_IS, 
            remoteIpStr, //ip
            nodeInfo.myHwInfo.mInfo.p2pAddr, //p2paddr
            nodeRoleInt, //role
            define.STATE.OFF, //state (Default Setting : OFF)
            nodeInfo.myHwInfo.mInfo.kafkaIdx, 
            nodeInfo.myHwInfo.mInfo.hubCode, 
            nodeInfo.myHwInfo.pubkey //pubkey
        ]
    );
    
    result = true;
    
    return result;
}
module.exports.setConsNode = setConsNode;

// const getRoleInt = (roleStr) => {
//     let roleInt = define.ERR_CODE.ERROR;

//     if (roleStr === define.NODE_ROLE.STR.NN)
//     {
//         roleInt = define.NODE_ROLE.NUM.NN;
//     }
//     else if (roleStr === define.NODE_ROLE.STR.DBN)
//     {
//         roleInt = define.NODE_ROLE.NUM.DBN;
//     }
//     else if (roleStr === define.NODE_ROLE.STR.ISAG)
//     {
//         roleInt = define.NODE_ROLE.NUM.ISAG;
//     }

//     return roleInt;
// }
// module.exports.getRoleInt = getRoleInt;

// NODE_INFO
const updateNodeInfo = async function (nodeInfo, nodeRoleInt, total_prr_point) {
    logger.debug("func : updateNodeInfo");

    nodeInfo.myHwInfo.mCalc = {};
    
    nodeInfo.myHwInfo.mCalc.totalPrrPoint = total_prr_point;
    
    nodeInfo.myHwInfo.mCalc.totalMemSize = calculate_mem_size(nodeInfo);
    nodeInfo.myHwInfo.mCalc.totalHddSize = calculate_hdd_size(nodeInfo);
    nodeInfo.myHwInfo.mCalc.totalSsdSize = calculate_ssd_size(nodeInfo);
    nodeInfo.myHwInfo.mCalc.totalNvmeSize = calculate_nvme_size(nodeInfo);
    nodeInfo.myHwInfo.mCalc.lanChecking = true;
    nodeInfo.myHwInfo.mCalc.raidChecking = check_raid(nodeInfo);

    //
    nodeInfo.myHwInfo.mInfo = {};
    nodeInfo.myHwInfo.mInfo.hubCode = define.ERR_CODE.ERROR;
    nodeInfo.myHwInfo.mInfo.p2pAddr = "0";
    nodeInfo.myHwInfo.mInfo.kafkaIdx = define.ERR_CODE.ERROR;

    // NN or ISAg node
    if ((nodeRoleInt === define.NODE_ROLE.NUM.NN) || (nodeRoleInt === define.NODE_ROLE.NUM.ISAG))
    {
        //
        let cluster_p2p_addr;
        let nodeClusterInfoRes = await dbUtil.queryPre(dbIS.querys.is.cluster_info.selectClusterInfoBySnHash, [nodeInfo.myHwInfo.snHash]);
        if (nodeClusterInfoRes.length)
        {
            cluster_p2p_addr = nodeClusterInfoRes[0].cluster_p2p_addr;
        }
        else
        {
            logger.error('Error - No data from cluster_info table');
            logger.error('This is an unregistered node. (Check your sn_hash)');

            return define.ERR_CODE.ERROR;
        }

        logger.debug('cluster_p2p_addr : ' + cluster_p2p_addr);

        // Select All hub_info items
        let hub_code = define.ERR_CODE.ERROR;

        let hubGps = await dbUtil.query(dbIS.querys.is.hub_info.selectHubInfo);
        if (hubGps.length)
        {
            logger.debug('hubInfoRes : ' + JSON.stringify(hubGps));
            
            for(var i = 0; i < hubGps.length ; i++)
            {
                let gpsClusterP2pAddr = cluster_p2p_addr.slice(0, 10);
                let gpsP2pAddr = gpsToP2pAddr(hubGps[i].latitude, hubGps[i].longitude);
                logger.debug('gpsClusterP2pAddr : ' + gpsClusterP2pAddr + ", gpsP2pAddr : " + gpsP2pAddr);

                if (gpsClusterP2pAddr === gpsP2pAddr)
                {
                    hub_code = hubGps[i].hub_code;
                    break;
                }
            }
        }
        else
        {
            logger.error('Error - No data from cluster_info table');

            return define.ERR_CODE.ERROR;
        }

        //
        if (hub_code !== define.ERR_CODE.ERROR)
        {
            nodeInfo.myHwInfo.mInfo.hubCode = hub_code;

            let subNetAddr = util.leftPadding(nodeRoleInt, 4);

            nodeInfo.myHwInfo.mInfo.p2pAddr = cluster_p2p_addr + subNetAddr;

            //
            let kafkaIdx = await getKafkaIdx(cluster_p2p_addr);
        
            nodeInfo.myHwInfo.mInfo.kafkaIdx = kafkaIdx;
        }
    }

    return nodeInfo;
}

module.exports.updateNodeInfo = updateNodeInfo;

module.exports.registConsNode = async(nodeInfo, socket, nodeRoleInt, totalPrrPoint) =>{
    myNodeInfo = await updateNodeInfo(nodeInfo, nodeRoleInt, totalPrrPoint);

    if (myNodeInfo === define.ERR_CODE.ERROR)
    {
        logger.error("Error - registConsNode");
        return false;
    }
    else
    {
        logger.debug("Node Info : " + JSON.stringify(myNodeInfo));
        isComplete = await setConsNode(myNodeInfo, socket, nodeRoleInt);
    
        return isComplete;
    }
}

const getKafkaIdx = async (p2pAddr) => {
    let kafkaIdx = define.ERR_CODE.ERROR;
    let topicList = p2pAddr;

    if(p2pAddr.slice(0,2) === '0x')
    {
        topicList = p2pAddr.slice(2);
    }

    kafkaInfo = await dbUtil.queryPre(dbIS.querys.is.kafka_info.selectKafkaInfoByTopicList, [topicList]);
    if (kafkaInfo.length)
    {
        // for (var i = 0; i < kafkaInfo.length; i++)
        // {
        //     if (((kafkaInfo[i].topic_list).split(',')).indexOf(topicList) !== define.ERR_CODE.ERROR)
        //     {
        //         kafkaIdx = kafkaInfo[i].idx;
        //     }
        // }

        kafkaIdx = kafkaInfo[0].idx;
    }
    else
    {
        logger.error("Error - NO data from kafka_info table");
    }

    logger.debug("kafkaIdx : " + kafkaIdx);

    return kafkaIdx;
}

function calculate_mem_size(data) {
    let totalMemSize = 0;
    for (var i = 0; i < data.myHwInfo.mem.size.length; i++) {
        totalMemSize += parseFloat(data.myHwInfo.mem.size[i]);
    }
    return totalMemSize;
}

function calculate_hdd_size(data) {
    let totalHddSize = 0;
    for (var i = 0; i < data.myHwInfo.storage.hdd.size.length; i++) {
        totalHddSize += parseFloat(data.myHwInfo.storage.hdd.size[i]);
    }
    return totalHddSize;
}

function calculate_ssd_size(data) {
    let totalSsdSize = 0;
    for (var i = 0; i < data.myHwInfo.storage.ssd.size.length; i++) {
        totalSsdSize += parseFloat(data.myHwInfo.storage.ssd.size[i]);
    }
    return totalSsdSize;
}

function calculate_nvme_size(data) {
    let totalNvmeSize = 0;
    for (var i = 0; i < data.myHwInfo.storage.nvme.size.length; i++) {
        totalNvmeSize += parseFloat(data.myHwInfo.storage.nvme.size[i]);
    }
    return totalNvmeSize;
}

function check_raid(data) {
    if ((data.myHwInfo.storage.hdd.raid.type === 'none') && 
        (data.myHwInfo.storage.ssd.raid.type === 'none') && 
        (data.myHwInfo.storage.nvme.raid.type === 'none'))
    {
        return false;
    }
    else
    {
        return true;
    }
}
