//
const fs = require('fs');

//
const cryptoSsl = require("./../../../../addon/crypto-ssl");

//
const config = require('./../../config/config.js');
const define = require('./../../config/define.js');
const dbUtil = require('./../db/dbUtil.js');
const dbIS = require('./../db/dbIS.js');
const dbShard = require('./../db/dbShard.js');
const dbISHandler = require('../db/dbISHandler.js');
const ctx = require('./../net/ctx.js');
const netUtil = require('./../net/netUtil.js');
const netConf = require('./../net/netConf.js');
const netSend = require('./../net/netSend.js');
const contractProc = require('./../contract/contractProc.js');
const contractUtil = require('./../contract/contractUtil.js');
const kafkaUtil = require('./../net/kafkaUtil.js');
const util = require('./../utils/commonUtil.js');
const cryptoUtil = require('./../sec/cryptoUtil.js');
const reg = require('./../reg/registration.js');
const repl = require('./../reg/replication.js');
const socket = require('./../net/socket.js');
const cliTest = require('./../cli/cliTest.js');
const logger = require('./../utils/winlog.js');

//
module.exports.handler = async (cmd) => {
    // Command Handler Start
    let map = ctx.getCTXMap();

    let retVal = true;

    logger.info('IS CLI Received Data : ' + cmd);

    let cmdSplit = cmd.split(' ');

    // is --help
    if (cmd === define.CMD.help_req1 || cmd == define.CMD.help_req2)
    {
        console.log(define.CMD.help_res);
    }
    // is --version || -v
    else if (cmd === define.CMD.version_req1 || cmd == define.CMD.version_req2)
    {
        console.log(define.CMD.version_res);
    }
    // is --net reset ||  -nrst
    else if ((cmd === define.CMD.net_reset_req1) || (cmd === define.CMD.net_reset_req2))
    {
        await netSend.writeSomeNoData(map, define.CMD.req_reset, dbIS.querys.is.node_cons_info.selectNodeConsInfo);
    }
    // is --net make || -nmk
    else if ((cmd === define.CMD.net_make_req1) || (cmd === define.CMD.net_make_req2))
    {
        await netConf.makeNetConf(map.size);
    }
    // is --net save || -nsv
    else if ((cmd === define.CMD.net_save_req1) || (cmd === define.CMD.net_save_req2))
    {
        let ret = await netConf.makeNetConf(map.size);

        if (ret === true)
        {
            await netSend.sendNetConf(map);
        }
    }
    // is --net rerun || -nrr
    else if ((cmd === define.CMD.net_rerun_req1) || (cmd === define.CMD.net_rerun_req2))
    {
        let ret = await netSend.sendNetConf(map);
        
        if (ret === true)
        {
            await netSend.writeSomeNoData(map, define.CMD.req_rerun, dbIS.querys.is.node_cons_info.selectNodeConsInfo);
        } 
    }
    // is --net update || -nup
    else if ((cmd === define.CMD.net_update_req1) || (cmd === define.CMD.net_update_req2))
    {
        await netSend.sendNetUpdate(map, netConf.getLastBlkNum());
    }
    // is --net init || -nini
    else if ((cmd === define.CMD.net_init_req1) || (cmd === define.CMD.net_init_req2))
    {
        await netSend.writeSomeNoData(map, define.CMD.req_net_init, dbIS.querys.is.node_cons_info.selectNodeConsInfoByRole, define.NODE_ROLE.NUM.NN);
    }
    // is --node start || -nstt
    else if ((cmd === define.CMD.node_start_req1) || (cmd === define.CMD.node_start_req2))
    {
        await netSend.writeSomeNoData(map, define.CMD.req_node_start, dbIS.querys.is.node_cons_info.selectNodeConsInfo);
    }
    // is --node kill || -nkil
    else if ((cmd === define.CMD.node_kill_req1) || (cmd === define.CMD.node_kill_req2))
    {
        await netSend.writeSomeNoData(map, define.CMD.req_node_kill, dbIS.querys.is.node_cons_info.selectNodeConsInfo);

        // 
        if(config.DB_TEST_MODE)
        {
            // netConf.setLastBlkNum(0);
            await dbIS.truncateIsTestNodeKillDB();
        }
    }
    // is --net next || -nnxt
    else if ((cmd === define.CMD.node_next_req1) || (cmd === define.CMD.node_next_req2))
    {
        await netSend.writeSomeNoData(map, define.CMD.req_rr_next, dbIS.querys.is.node_cons_info.selectNodeConsInfoByRole, define.NODE_ROLE.NUM.NN);
    }
    // is --block gen start || -bgstt
    else if ((cmd === define.CMD.bg_start_req1) || (cmd === define.CMD.bg_start_req2))
    {
        await netSend.writeSomeNoData(map, define.CMD.req_bg_start, dbIS.querys.is.node_cons_info.selectNn0Info);
    }
    // is --block gen stop || -bgstop
    else if ((cmd === define.CMD.bg_stop_req1) || (cmd === define.CMD.bg_stop_req2))
    {
        //
        await netSend.writeSomeNoData(map, define.CMD.req_bg_stop, dbIS.querys.is.node_cons_info.selectNn0Info);
    }
    // is --block gen restart || -bgrstt
    else if ((cmd === define.CMD.bg_restart_req1) || (cmd === define.CMD.bg_restart_req2))
    {
        await netSend.writeSomeNoData(map, define.CMD.req_bg_restart, dbIS.querys.is.node_cons_info.selectNn0Info);
    }
    // is --get last bn || -lbn
    else if ((cmd === define.CMD.last_bn_req1) || (cmd === define.CMD.last_bn_req2))
    {
        await netSend.writeSomeNoData(map, define.CMD.req_last_bn, dbIS.querys.is.node_cons_info.selectNn0Info);
    }
    // is --act query
    else if (cmd.slice(0,14) === define.CMD.db_act_query_req1)
    {
        await dbUtil.actQuery(cmd.slice(15));
    }
    // is --db truncate test || -dtt
    else if ((cmd === define.CMD.db_truncate_test_req1) || (cmd === define.CMD.db_truncate_test_req2))
    {
        await dbIS.truncateIsTestDB();
    }
    // is --db truncate remote || -dtr
    else if ((cmd === define.CMD.db_truncate_remote_req1) || (cmd === define.CMD.db_truncate_remote_req2))
    {
        //
        await netSend.writeSomeNoData(map, define.CMD.req_db_truncate, dbIS.querys.is.node_cons_info.selectNodeConsInfo);
    }
    // is --db truncate || -dt
    else if ((cmd === define.CMD.db_truncate_req1) || (cmd === define.CMD.db_truncate_req2))
    {
        //
        await netSend.writeSomeNoData(map, define.CMD.req_db_truncate, dbIS.querys.is.node_cons_info.selectNodeConsInfo);

        //
        // netConf.setLastBlkNum(0);
        await dbIS.truncateIsTestNodeKillDB();
    }
    // is --db repl saveis || -rsaveis
    else if ((cmd === define.CMD.db_repl_saveis1) || (cmd === define.CMD.db_repl_saveis2)) // Execute it before setting `is` initial values. 
    {
        //
        await repl.saveReplMyData(netConf.getLastBlkNum());
    }
    // is --db repl get || -rget
    else if ((cmd === define.CMD.db_repl_get1) || (cmd === define.CMD.db_repl_get2))
    {
        await netSend.writeSomeNoData(map, define.CMD.req_db_repl_get, dbIS.querys.is.node_cons_info.selectNodeConsInfoByRole, define.NODE_ROLE.NUM.NN);
    }
    // is --db repl set || -rset
    else if ((cmd === define.CMD.db_repl_set1) || (cmd === define.CMD.db_repl_set2))
    {
        // //
        // await repl.saveReplMyData(netConf.getLastBlkNum());

        //
        await repl.setReplNN(map, netConf.getLastBlkNum());
        await repl.setReplISAg(map, netConf.getLastBlkNum());
    }
    // is --db repl stop || -rstop
    else if ((cmd === define.CMD.db_repl_stop1) || (cmd === define.CMD.db_repl_stop2))
    {
        await netSend.writeSomeNoData(map, define.CMD.req_db_repl_stop, dbIS.querys.is.node_cons_info.selectNodeConsInfo);
    }
    // is --db repl reset || -rrst
    else if ((cmd === define.CMD.db_repl_reset1) || (cmd === define.CMD.db_repl_reset2))
    {
        await netSend.writeSomeNoData(map, define.CMD.req_db_repl_reset, dbIS.querys.is.node_cons_info.selectNodeConsInfo);
    }
    // is --db repl start || -rstt
    else if ((cmd === define.CMD.db_repl_start1) || (cmd === define.CMD.db_repl_start2))
    {
        await netSend.writeSomeNoData(map, define.CMD.req_db_repl_start, dbIS.querys.is.node_cons_info.selectNodeConsInfo);
    }
    // is --repl data get
    else if (cmd === define.CMD.repl_data_get1)
    {
        let replDataArr = await repl.getReplDataArr(netConf.getLastBlkNum());
        if (replDataArr.length)
        {
            logger.debug("replDataArr : " + JSON.stringify(replDataArr));
        }
    }
    // is --repl data reset
    else if (cmd == define.CMD.repl_data_reset1)
    {
        await repl.resetReplData();
    }
    // is --shard user add
    else if (cmd === define.CMD.shard_user_add1)
    {
        await dbShard.createShardUser();
    }
    // is --shard user del
    else if (cmd === define.CMD.shard_user_del1)
    {
        await dbShard.dropShardUser();
    }
    // is --gc add user is || -gc aui
    else if (cmd === define.CMD.gc_add_user_is1 || cmd === define.CMD.gc_add_user_is2)
    {
        let gcAddUser = contractProc.gcAddUserIS();

        // let contractJson = JSON.stringify(gcAddUser);
        // logger.debug("contractJson : " + contractJson);
        let contractJson = gcAddUser;
        logger.debug("contractJson : " + JSON.stringify(contractJson));

        await netSend.writeSome(map, define.CMD.req_contract_txs, contractJson, dbIS.querys.is.node_cons_info.selectNn0Info);
    }
    // is --gc create token || -gc ct
    else if (cmd === define.CMD.gc_crate_token1 || cmd === define.CMD.gc_crate_token2)
    {
        let gcCreateSt = contractProc.gcCreateSecToken();

        // let contractJson = JSON.stringify(gcCreateSt);
        // logger.debug("contractJson : " + contractJson);
        let contractJson = gcCreateSt;
        logger.debug("contractJson : " + JSON.stringify(contractJson));

        await netSend.writeSome(map, define.CMD.req_contract_txs, contractJson, dbIS.querys.is.node_cons_info.selectNn0Info);
    }
    // is --gc create tokenk || -gc ctk
    else if (cmd === define.CMD.gc_crate_token_k1 || cmd === define.CMD.gc_crate_token_k2)
    {
        //
        // let dir = './key';
        let dir = './../../conf/test/key/ed/key_07';
        // let dir = cmd.slice(18);
        logger.debug("dir : " + dir);

        //
        let ownerPriKeyPath = dir + '/' + 'ed_privkey.fin';
        let ownerPubkeyPath = dir + '/' + 'ed_pubkey.pem';

        let ownerPubkey = cryptoUtil.getPubkey(ownerPubkeyPath);
        let superPubkey = cryptoUtil.getPubkey(ownerPubkeyPath);
        let ownerPrikey = fs.readFileSync(ownerPriKeyPath, 'binary');
        let onwerPrikeyPw = 'asdfQWER1234!@#$';

        let gcCreateSt = contractProc.gcCreateSecTokenWithKey(ownerPubkey, superPubkey, ownerPrikey, onwerPrikeyPw);

        // let contractJson = JSON.stringify(gcCreateSt);
        // logger.debug("contractJson : " + contractJson);
        let contractJson = gcCreateSt;
        logger.debug("contractJson : " + JSON.stringify(contractJson));

        await netSend.writeSome(map, define.CMD.req_contract_txs, contractJson, dbIS.querys.is.node_cons_info.selectNn0Info);
    }
    else if (cmd.slice(0,7) === define.CMD.testContract)
    {
        let txCnt = cmd.slice(8);

        logger.debug('txCnt : ' + Number(txCnt));

        await netSend.writeSome(map, define.CMD.req_contract_test, Number(txCnt), dbIS.querys.is.node_cons_info.selectNn0Info);
    }
    // is --hub add
    else if (cmd.slice(0,12) === define.CMD.hub_add_req1)
    {
        retVal = await dbISHandler.addHub(cmd);
    }
    // is --cluster add
    else if (cmd.slice(0,16) === define.CMD.cluster_add_req1)
    {
        retVal = await dbISHandler.addCluster(cmd);
    }
    // is --cluster del
    else if (cmd.slice(0,16) === define.CMD.cluster_del_req1)
    {
        retVal = await dbISHandler.delCluster(cmd);
    }
    // is --kafka add
    else if (cmd.slice(0,14) === define.CMD.kafka_add_req1)
    {
        await dbISHandler.addKafka(cmd);
    }
    // is --token add
    else if (cmd.slice(0,14) === define.CMD.token_add_req1)
    {
        await dbISHandler.addToken(cmd);
    }
    // is --sysinfo init
    else if (cmd.slice(0,17) === define.CMD.sysinfo_init_req1)
    {
        await dbISHandler.initSystemInfo(define.DATA_HANDLER.status_cmd.stop);
    }
    // is --kafka init || -kini
    else if (cmd.slice(0,15) === define.CMD.kafka_init_req1 || cmd.slice(0,5) === define.CMD.kafka_init_req2)
    {
        await kafkaUtil.initKafka();
    }
    // is --kafka get || -kget
    else if (cmd.slice(0,14) === define.CMD.kafka_get_req1 || cmd.slice(0,5) === define.CMD.kafka_get_req2)
    {
        await kafkaUtil.getKafkaTopicList();
    }
    // is --kafka del || -kdel
    else if (cmd.slice(0,14) === define.CMD.kafka_del_req1 || cmd.slice(0,5) === define.CMD.kafka_del_req2)
    {
        await kafkaUtil.delKafkaTopicList();
    }
    // is --ip list || -ips
    else if  (cmd.slice(0,12) === define.CMD.ip_list1 || cmd.slice(0,4) === define.CMD.ip_list2)
    {
        let localIPs = util.getMyIPs();
        //
        await util.asyncForEach(localIPs, async(element, index) => {
            logger.debug("ip[" + index + "] : " + element);
        });
    }
    // is --test
    else if (cmd.slice(0,9) === define.CMD.test1)
    {
        retVal = await cliTest.cliTestHandler(cmd.slice(10), map);
    }
    // -t
    else if (cmd.slice(0,2) === define.CMD.test2){
        retVal = await cliTest.cliTestHandler(cmd, map);
    }
    // // mysql passwd OOOOO
    // else if (cmd.slice(0,12) === define.CMD.db_passwd_req1)
    // {
    //     let result = cryptoSsl.aesEncPw(config.KEY_PATH.PW_SEED, CMD.slice(13), CMD.slice(13).length, config.KEY_PATH.PW_MARIA);
    
    //     if (result === true)
    //     {
    //         logger.debug("[CLI] "+ define.CMD.rep_db_passwd_success);
    //     }
    //     else
    //     {
    //         logger.error("[CLI] " + define.CMD.rep_db_passwd_error);
    //     }
    // }
    // key enc/dec/read OOOOO
    else if (cmd.slice(0,3) === define.CMD.key_crypt_req)
    {
        let crypt = cmd.split(' ')[1];

        let orgFilePath = cmd.split(' ')[2];
        let orgFile = fs.readFileSync(orgFilePath);

        if (crypt === 'enc')
        {
            //
            if (orgFilePath.includes('pem'))
            {
                //
                let dstFilePath = util.stringReplace(orgFilePath, 'pem', 'fin');

                //
                let keySeed = config.INFO_PATH.KEY_SEED;

                logger.debug("[CLI] orgFilePath : " + orgFilePath + ", dstFilePath : " + dstFilePath + ", keySeed : " + keySeed);

                //
                let result = cryptoSsl.aesEncFile(orgFilePath, dstFilePath, keySeed, keySeed.length);
            
                if (result = true)
                {
                    logger.debug("[CLI] " + define.CMD.rep_ed_prikey_success);
                }
                else
                {
                    logger.error("[CLI] " + define.CMD.rep_ed_prikey_error);
                }
            }
            else
            {
                logger.error("[CLI] " + define.CMD.rep_ed_prikey_error);
            }
        }
        else if (crypt === 'dec')
        {
            //
            if (orgFilePath.includes('fin'))
            {
                //
                let keySeed = config.INFO_PATH.KEY_SEED;

                logger.debug("[CLI] orgFilePath : " + orgFilePath + ", keySeed : " + keySeed);

                let decFile = cryptoSsl.aesDecFile(orgFilePath, keySeed, keySeed.length);
                logger.debug(decFile);
            }
            else
            {
                logger.error("[CLI] " + define.CMD.rep_ed_prikey_error);
            }
        }
        // key read OOOOO
        else if (crypt === 'read')
        {
            if (orgFilePath.includes('pubkey'))
            {
                let pemRead = cryptoUtil.readPubkeyPem(orgFilePath, config.INFO_PATH.KEY_SEED);

                if (orgFilePath.includes('ed'))
                {
                    let pubkeyHex = util.bytesToBuffer(pemRead.keyData.bytes).toString('hex');
                    logger.debug("pubkeyHex : " + pubkeyHex);
                }
                else // ec
                {
                    let ec_point_x = util.bytesToBuffer(pemRead.keyData.x).toString('hex');
                    let ec_point_y = util.bytesToBuffer(pemRead.keyData.y).toString('hex');

                    logger.debug("ec_point_x : " + ec_point_x);
                    logger.debug("ec_point_y : " + ec_point_y);
                }
            }
            else
            {
                let pemRead = cryptoUtil.readPrikeyPem(orgFilePath, config.INFO_PATH.KEY_SEED);

                if (orgFilePath.includes('ed'))
                {
                    let prikeyHex = util.bytesToBuffer(pemRead.keyData.seed).toString('hex');
                    logger.debug("prikeyHex : " + prikeyHex);
                }
                else // ec
                {
                    let prikeyHex = util.bytesToBuffer(pemRead.keyData.d).toString('hex');
                    logger.debug("prikeyHex : " + prikeyHex);
                }
            }
        }
    }
    else
    {
        retVal = false;
        logger.error("[CLI] " + cmd + ' is an incorrect command. See is --help');
    }

    return retVal;
}
