//
const config = require('../../config/config.js');
const define = require('../../config/define.js');
const dbUtil = require('./dbUtil.js');
const dbIS = require('./dbIS.js');
const reg = require('../reg/registration.js');
const contractUtil = require('../contract/contractUtil.js');
const util = require('../utils/commonUtil.js');
const logger = require('../utils/winlog.js');

////////////////////////////////////////////////////////////
// Add Hub on DB
module.exports.addHub = async (cmd) => {
    let cmdSplit = cmd.split(' ');
    let hub_code_value = cmdSplit[cmdSplit.indexOf(define.CMD.hub_add_option1) + 1];
    let name_value = cmdSplit[cmdSplit.indexOf(define.CMD.hub_add_option2) + 1];
    let gps = cmdSplit[cmdSplit.indexOf(define.CMD.hub_add_option3) + 1].split(define.CMD.hub_add_option4);
    let latitude = gps[0];
    let longitude = gps[1];


    let fixedLatitude = util.numToFixed(latitude, define.P2P_DEFINE.P2P_GPS_DECIMAL_POINT);
    let fixedLongitude = util.numToFixed(longitude, define.P2P_DEFINE.P2P_GPS_DECIMAL_POINT);

    logger.debug("latitude : " + latitude + ", fixedLatitude : " + fixedLatitude);
    logger.debug("longitude : " + longitude + ", fixedLongitude : " + fixedLongitude);

    if(fixedLongitude)
    {
        let geo = await util.geocoderReverse(fixedLatitude, fixedLongitude);

        if(geo.country)
        {
            //
            let gps_addr = reg.gpsToP2pAddr(fixedLatitude, fixedLongitude);
            let country_addr = contractUtil.countryCode(geo.country);
            let hub_addr_tmp = (hub_code_value << 2).toString(16);
            let hub_addr = util.leftPadding(hub_addr_tmp, 2);
            logger.debug("gps_addr : " + gps_addr + ", country_addr : " + country_addr + ", hub_addr_tmp : " + hub_addr_tmp + ", hub_addr : " + hub_addr);

            let hub_p2p_addr = gps_addr + country_addr + hub_addr;

            if(geo.city)
            {
                await dbUtil.queryPre(dbIS.querys.is.hub_info.insertHubInfo, [define.P2P_DEFINE.P2P_SUBNET_ID_IS, hub_code_value, name_value, latitude, longitude, geo.country, geo.city, hub_p2p_addr]);
                logger.debug("[CLI] " + hub_code_value + ' Hub add success');
            }
            else
            {
                await dbUtil.queryPre(dbIS.querys.is.hub_info.insertHubInfoWithoutCity, [define.P2P_DEFINE.P2P_SUBNET_ID_IS, hub_code_value, name_value, latitude, longitude, geo.country, hub_p2p_addr]);
                logger.debug("[CLI] " + 'Cannot Find City name. so city = NULL');
            }

            return true;
        }
        else
        {
            logger.error("[CLI] " + 'Cannot Find Country Code. Fail to Add Hub');
            return false;
        }
    }
    else
    {
        logger.error("[CLI] " + 'Do not leave a space between latitude and longitude.(OO.OO,OO.OO)');
        return false;
    }
}

// Add Cluster On DB
module.exports.addCluster = async (cmd) => {
    let ret_val = false;

    let cmdSplit = cmd.split(' ');
    let hub_code_value = cmdSplit[cmdSplit.indexOf(define.CMD.cluster_add_option1) + 1];
    let group_value = cmdSplit[cmdSplit.indexOf(define.CMD.cluster_add_option2) + 1];
    let ip_value = cmdSplit[cmdSplit.indexOf(define.CMD.cluster_add_option3) + 1];
    let role_value = cmdSplit[cmdSplit.indexOf(define.CMD.cluster_add_option4) + 1];
    let sn_value = cmdSplit[cmdSplit.indexOf(define.CMD.cluster_add_option5) + 1];

    let hubInfoRes = await dbUtil.queryPre(dbIS.querys.is.hub_info.selectHubInfoByHubCode, [hub_code_value]);
    if (hubInfoRes.length)
    {
        // let hub_gps_country = await JSON.parse(hubInfoRes);
        let hub_p2p_addr = hubInfoRes[0].hub_p2p_addr;

        logger.debug("hub_p2p_addr : " + hub_p2p_addr);

        if(group_value > config.NET_CONF_SET.MAX_GRP)
        {
            logger.error("[CLI] " + 'group value too large! You can have up to three groups per hub.');
        }
        else
        {
            //
            let roleInt = define.getRoleInt(role_value);
            if (roleInt !== define.ERR_CODE.ERROR)
            {
                let cluster_p2p_addr_int = BigInt(hub_p2p_addr) + BigInt(group_value);
                let cluster_p2p_addr = '0x' + BigInt(cluster_p2p_addr_int).toString(16);

                logger.debug("ip_value : " + ip_value + ", sn_value : " + sn_value + ", cluster_p2p_addr : " + cluster_p2p_addr);
                
                await dbUtil.queryPre(dbIS.querys.is.cluster_info.insertClusterInfo, [define.P2P_DEFINE.P2P_SUBNET_ID_IS, ip_value, roleInt, sn_value, cluster_p2p_addr]);

                ret_val = true;
            }
        }
    }
    else
    {
        logger.error("Error - No data from hub_info table");
    }

    return ret_val;
}

// Delete Cluster on DB
module.exports.delCluster = async (cmd) => {
    let cmdSplit = cmd.split(' ');
    let p2p = cmdSplit.indexOf(define.CMD.cluster_del_option1);
    let ip = cmdSplit.indexOf(define.CMD.cluster_add_option3);
    let result = false;

    if(p2p !== define.ERR_CODE.ERROR)
    {
        let p2p_value = cmdSplit[cmdSplit.indexOf(define.CMD.cluster_del_option1) + 1];
        await dbUtil.queryPre(dbIS.querys.is.cluster_info.deleteClusterInfoByClusterP2pAddr, [p2p_value]);

        result = true;
    }
    else if(ip !== define.ERR_CODE.ERROR)
    {
        let ip_value = cmdSplit[cmdSplit.indexOf(define.CMD.cluster_add_option3) + 1];
        await dbUtil.queryPre(dbIS.querys.is.cluster_info.deleteClusterInfoByIp, [ip_value]);

        result = true;
    }

    return result;
}

// add kafka list
module.exports.addKafka = async(cmd) => {
    let ret_val = false;

    let cmdSplit = cmd.split(' ');
    let hub_code_value = cmdSplit[cmdSplit.indexOf(define.CMD.kafka_add_option1) + 1];
    let group_value = cmdSplit[cmdSplit.indexOf(define.CMD.kafka_add_option2) + 1];
    let broker_list = cmdSplit[cmdSplit.indexOf(define.CMD.kafka_add_option3) + 1];

    logger.debug("hub_code_value : " + hub_code_value + ", group_value : " + group_value + ", broker_list : " + broker_list);

    // let brokerSplit = broker_list.split(',');

    // //
    // let broker_list_obj = new Object();
    // let broker_list_array = new Array();

    // logger.debug("brokerSplit.length : " + brokerSplit.length);
    // for (let idx=0; idx<brokerSplit.length; idx++)
    // {
    //     broker_list_array.push(brokerSplit[idx]);
    //     logger.debug("brokerSplit[" + idx + "] : " + brokerSplit[idx]);
    // }

    // broker_list_obj.broker_list = broker_list_array;
    // logger.debug("broker_list_obj : " + JSON.stringify(broker_list_obj));


    //
    let hubInfoRes = await dbUtil.queryPre(dbIS.querys.is.hub_info.selectHubInfoByHubCode, [hub_code_value]);
    if (hubInfoRes.length)
    {
        let hub_p2p_addr = hubInfoRes[0].hub_p2p_addr;

        logger.debug("hub_p2p_addr : " + hub_p2p_addr);

        if (hub_p2p_addr.length === define.P2P_DEFINE.P2P_LEN)
        {
            if(Number(group_value) > config.NET_CONF_SET.MAX_GRP)
            {
                logger.error("[CLI] " +'group value too large! You can have up to three groups per hub.');
            }
            else
            {
                // //
                // let hub_uniq = util.hexStrToInt(hub_p2p_addr.slice(define.P2P_DEFINE.P2P_ROOT_SPLIT_INDEX.START));
                // let topicList = (hub_uniq + Number(group_value)).toString(16);
    
                //
                let cluster_p2p_addr_int = BigInt(hub_p2p_addr) + BigInt(group_value);
                let topicList = BigInt(cluster_p2p_addr_int).toString(16);
    
                logger.debug("broker_list : " + broker_list + ", topic : " + topicList);
    
                let kafkaInfoRes = await dbUtil.queryPre(dbIS.querys.is.kafka_info.selectKafkaInfoByTopicList, [topicList]);
                
                if (!kafkaInfoRes.length)
                {
                    await dbUtil.queryPre(dbIS.querys.is.kafka_info.insertKafkaInfo, [define.P2P_DEFINE.P2P_SUBNET_ID_IS, broker_list, topicList]);
                }
                else
                {
                    logger.error("Error - Topic is already existed. Topic : " + topicList);
                }
    
                ret_val = true;
            }
        }
        else
        {
            logger.error("Error - hub_p2p_addr length");
        }
    }
    else
    {
        logger.error("Error - No data from hub_info table");
    }

    return ret_val;
}

// Add Token On DB
module.exports.addToken = async (cmd) => {
    let ret_val = false;

    do
    {
        //
        let cmdSplit = cmd.split(' ');

        //
        let owner_pk_key = cmdSplit.indexOf(define.CMD.token_add_option1);
        let super_pk_key = cmdSplit.indexOf(define.CMD.token_add_option2);
        let logo_key = cmdSplit.indexOf(define.CMD.token_add_option3);
        let action_key = cmdSplit.indexOf(define.CMD.token_add_option4);
        let name_key = cmdSplit.indexOf(define.CMD.token_add_option5);
        let symbol_key = cmdSplit.indexOf(define.CMD.token_add_option6);
        let total_supply_key = cmdSplit.indexOf(define.CMD.token_add_option7);
        let decimal_point_key = cmdSplit.indexOf(define.CMD.token_add_option8);

        if ((owner_pk_key === define.ERR_CODE.ERROR) || 
            (super_pk_key === define.ERR_CODE.ERROR) ||
            (action_key === define.ERR_CODE.ERROR) ||
            (name_key === define.ERR_CODE.ERROR) ||
            (symbol_key === define.ERR_CODE.ERROR) ||
            (total_supply_key === define.ERR_CODE.ERROR) ||
            (decimal_point_key === define.ERR_CODE.ERROR))
        {
            break;
        }

        //
        let owner_pk_value = cmdSplit[cmdSplit.indexOf(define.CMD.token_add_option1) + 1];
        let super_pk_value = cmdSplit[cmdSplit.indexOf(define.CMD.token_add_option2) + 1];
        let logo_value = cmdSplit[cmdSplit.indexOf(define.CMD.token_add_option3) + 1];
        let action_value = cmdSplit[cmdSplit.indexOf(define.CMD.token_add_option4) + 1];
        let name_value = cmdSplit[cmdSplit.indexOf(define.CMD.token_add_option5) + 1];
        let symbol_value = cmdSplit[cmdSplit.indexOf(define.CMD.token_add_option6) + 1];
        let total_supply_value = cmdSplit[cmdSplit.indexOf(define.CMD.token_add_option7) + 1];
        let decimal_point_value = cmdSplit[cmdSplit.indexOf(define.CMD.token_add_option8) + 1];

        //
        logger.debug("token_add_option3 : " + cmdSplit.indexOf(define.CMD.token_add_option3));
        logger.debug("owner_pk_value : " + owner_pk_value);
        logger.debug("super_pk_value : " + super_pk_value);
        if (logo_key === define.ERR_CODE.ERROR)
        {
            logo_value = '';
        }
        logger.debug("logo_value : " + logo_value);
        logger.debug("action_value : " + action_value);
        logger.debug("name_value : " + name_value);
        logger.debug("symbol_value : " + symbol_value);
        logger.debug("total_supply_value : " + total_supply_value);
        logger.debug("decimal_point_value : " + decimal_point_value);

        //
        let regTokenRes = await dbUtil.queryPre(dbIS.querys.is.reg_token.selectRegTokenByActionNameSymbol, [action_value, name_value, symbol_value]);
        if (!regTokenRes.length)
        {
            logger.debug("reg_token action : " + action_value);
            // if (logo_key === define.ERR_CODE.ERROR)
            // {
            //     await dbUtil.queryPre(dbIS.querys.is.reg_token.insertRegTokenWithoutLogo, [define.P2P_DEFINE.P2P_SUBNET_ID_IS, owner_pk_value, super_pk_value, action_value, name_value, symbol_value, total_supply_value, decimal_point_value]);
            // }
            // else
            // {
                await dbUtil.queryPre(dbIS.querys.is.reg_token.insertRegToken, [define.P2P_DEFINE.P2P_SUBNET_ID_IS, owner_pk_value, super_pk_value, logo_value, action_value, name_value, symbol_value, total_supply_value, decimal_point_value]);
            // }
        }
        else
        {
            logger.error("Error - ond of values is already existed. action : " + action_value + ", name : " + name_value + ", symbol : " + symbol_value);
        }

        ret_val = true;
    } while(0);

    return ret_val;
}

// Init System Information On DB
module.exports.initSystemInfo = async (bg_status) => {
    let ret_val = false;

    //
    ret_val = true;

    //
    let net_info_json = {
        bg_status : bg_status
    };

    net_info = JSON.stringify(net_info_json);

    logger.debug("initSystemInfo net_info : " + net_info);

    await dbUtil.queryPre(dbIS.querys.is.system_info.insertSystemInfo, [define.P2P_DEFINE.P2P_SUBNET_ID_IS, net_info]);

    return ret_val;
}

// Update System Information On DB : bg_status
module.exports.changeNetInfoBgStatus = async (bg_status) => {
    let ret_val = false;

    ret_val = true;

    logger.debug("changeNetInfoBgStatus bg_status : " + bg_status);

    let systemInfoCnt = await dbUtil.query(dbIS.querys.is.system_info.selectCnt);
    if (systemInfoCnt.length && Number(systemInfoCnt[0].total_count) > 0 )
    {
        // 
        if ((bg_status === define.DATA_HANDLER.status_cmd.start) || (bg_status === define.DATA_HANDLER.status_cmd.stop))
        {
            await dbUtil.queryPre(dbIS.querys.is.system_info.updateNetInfoBgStatus, [bg_status]);
        }
        else
        {
            logger.error("Error - bg_status : " + bg_status);
        }
    }
    else
    {
        // 
        this.initSystemInfo(bg_status);
    }

    return ret_val;
}
