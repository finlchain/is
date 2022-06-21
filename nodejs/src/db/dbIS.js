//
const config = require('../../config/config.js');
const define = require('./../../config/define.js');
const util = require('./../utils/commonUtil.js');
const dbUtil = require("./../db/dbUtil.js");
const logger = require('./../utils/winlog.js');

//
const createDbNames = {
    "is" : "is",
}

module.exports.createTableNames = {
    isQuerys : [
        //
        "hub_info",
        "cluster_info",
        "kafka_info",
        //
        "node_hw_info",
        "node_cons_info",
        //
        "revision",
        "repl_info",
        //
        "reg_token",
        //
        "system_info",
    ]
}

const createTableFields = {
    isQuerys : [
        // hub_info
        "`subnet_id` smallint(5) unsigned DEFAULT 0 NOT NULL, "
        + "`hub_code` smallint(5) unsigned NOT NULL AUTO_INCREMENT, "
        + "`name` text BINARY NOT NULL, "
        + "`latitude` text NOT NULL, "
        + "`longitude` text NOT NULL, "
        + "`country` text , "
        + "`city` text , "
        + "`hub_p2p_addr` text NOT NULL, "
        + "PRIMARY KEY (`hub_code`, `subnet_id`) USING BTREE",

        // cluster_info
          "`subnet_id` smallint(5) unsigned DEFAULT 0 NOT NULL, "
        + "`ip` int(11) unsigned NOT NULL, "
        + "`role` tinyint(3) unsigned NOT NULL, "
        + "`sn_hash` text NOT NULL, "
        + "`cluster_p2p_addr` text NOT NULL, "
        + "PRIMARY KEY (`ip`, `subnet_id`) USING BTREE",

        // kafka_info
          "`subnet_id` smallint(5) unsigned DEFAULT 0 NOT NULL, "
        + "`idx` smallint(5) unsigned NOT NULL AUTO_INCREMENT, "
        + "`broker_list` text NOT NULL , "
        + "`topic_list` text, "
        + "PRIMARY KEY (`idx`, `subnet_id`) USING BTREE",

        // node_hw_info
          "`subnet_id` smallint(5) unsigned DEFAULT 0 NOT NULL, "
        + "`idx` smallint(5) unsigned NOT NULL AUTO_INCREMENT, "
        + "`ip` int(11) unsigned NOT NULL, "
        + "`join_time` bigint(20) unsigned NOT NULL, "
        + "`sn_hash` text NOT NULL, "
        + "`ip_list` text NOT NULL, "
        + "`lan_speed_list` text NOT NULL, "
        + "`cpu` text NOT NULL, "
        + "`hdd_size` text, "
        + "`hdd_raid` text, "
        + "`ssd_size` text, "
        + "`ssd_raid` text, "
        + "`nvme_size` text, "
        + "`nvme_raid` text, "
        + "`mem_size` text NOT NULL, "
        + "`mem_speed` int(11) unsigned NOT NULL, "
        + "`lan_check` tinyint(1) unsigned NOT NULL, "
        + "`raid_check` tinyint(1) unsigned NOT NULL, "
        + "`virtual_check1` tinyint(1) unsigned NOT NULL, "
        + "`virtual_check2` tinyint(1) unsigned NOT NULL, "
        + "`total_prr` smallint(5) unsigned DEFAULT 0 NOT NULL, "
        + "PRIMARY KEY (`idx`, `ip`, `subnet_id`) USING BTREE",

        // node_cons_info
          "`subnet_id` smallint(5) unsigned DEFAULT 0 NOT NULL, "
        + "`idx` smallint(5) unsigned NOT NULL AUTO_INCREMENT, "
        + "`ip` int(11) unsigned NOT NULL, "
        + "`p2p_addr` text, "
        + "`role` tinyint(3) unsigned NOT NULL, "
        + "`state` tinyint(1) NOT NULL, "
        + "`kafka_idx` smallint(5), "
        + "`hub_code` smallint(5), "
        + "`pubkey` text NOT NULL, "
        + "PRIMARY KEY (`idx`, `role`, `subnet_id`) USING BTREE",

        // revision
          "`subnet_id` smallint(5) unsigned DEFAULT 0 NOT NULL, "
        + "`idx` smallint(5) unsigned NOT NULL AUTO_INCREMENT, "
        + "`update_time` bigint(20) unsigned NOT NULL , "
        + "`rr_net` json DEFAULT NULL, "
        + "`nn_node` json DEFAULT NULL, "
        + "PRIMARY KEY (`idx`, `subnet_id`) USING BTREE",

        // repl_info
          "`subnet_id` smallint(5) unsigned DEFAULT 0 NOT NULL, "
        + "`idx` smallint(5) unsigned NOT NULL AUTO_INCREMENT, "
        + "`blk_num` bigint(20) unsigned DEFAULT 0 NOT NULL COMMENT 'Block Number', "
        + "`ip` text NOT NULL, "
        + "`role` tinyint(3) unsigned NOT NULL, "
        + "`log_file` text NOT NULL, "
        + "`log_pos` text NOT NULL, "
        + "`cluster_p2p_addr` text NOT NULL, "
        // + "`repl_data` json DEFAULT NULL,"
        + "PRIMARY KEY (`idx`, `blk_num`, `role`, `subnet_id`) USING BTREE",

        // reg_token
          "`subnet_id` smallint(5) unsigned DEFAULT 0 NOT NULL, "
        + "`idx` smallint(5) unsigned NOT NULL AUTO_INCREMENT, "
        + "`owner_pk` text NOT NULL COMMENT 'Owner Public Key', "
        + "`super_pk` text NOT NULL COMMENT 'Super Owner Public Key', "
        + "`logo` longblob DEFAULT NULL COMMENT 'token logo', "
        + "`action` int(11) unsigned NOT NULL DEFAULT 0, "
        + "`name` text DEFAULT NULL, "
        + "`symbol` text DEFAULT NULL, "
        + "`total_supply` text DEFAULT 0 NOT NULL, "
        + "`decimal_point` smallint(5) unsigned DEFAULT 0 NOT NULL, "
        + "KEY `pubkey` (`owner_pk`(64), `super_pk`(64)) USING BTREE, "
        + "KEY `symbol` (`symbol`(4)) USING BTREE, "
        + "KEY `name` (`name`(10)) USING BTREE, "
        + "PRIMARY KEY (`idx`, `action`, `subnet_id`) USING BTREE",

        // system_info
          "`subnet_id` smallint(5) unsigned DEFAULT 0 NOT NULL, "
        + "`idx` smallint(5) unsigned NOT NULL AUTO_INCREMENT, "
        + "`net_info` json DEFAULT NULL, "
        + "PRIMARY KEY (`idx`, `subnet_id`) USING BTREE",
    ]
}

module.exports.createTables = {
    isQuerys : [
        `CREATE TABLE IF NOT EXISTS ${dbUtil.tableAppendix.tableName} (`
        + createTableFields.isQuerys[0]
        + `) ${dbUtil.tableAppendix.appendix}`,
        `CREATE TABLE IF NOT EXISTS ${dbUtil.tableAppendix.tableName} (`
        + createTableFields.isQuerys[1]
        + `) ${dbUtil.tableAppendix.appendix}`,
        `CREATE TABLE IF NOT EXISTS ${dbUtil.tableAppendix.tableName} (`
        + createTableFields.isQuerys[2]
        + `) ${dbUtil.tableAppendix.appendix}`,
        `CREATE TABLE IF NOT EXISTS ${dbUtil.tableAppendix.tableName} (`
        + createTableFields.isQuerys[3]
        + `) ${dbUtil.tableAppendix.appendix}`,
        `CREATE TABLE IF NOT EXISTS ${dbUtil.tableAppendix.tableName} (`
        + createTableFields.isQuerys[4]
        + `) ${dbUtil.tableAppendix.appendix}`,
        `CREATE TABLE IF NOT EXISTS ${dbUtil.tableAppendix.tableName} (`
        + createTableFields.isQuerys[5]
        + `) ${dbUtil.tableAppendix.appendix}`,
        `CREATE TABLE IF NOT EXISTS ${dbUtil.tableAppendix.tableName} (`
        + createTableFields.isQuerys[6]
        + `) ${dbUtil.tableAppendix.appendix}`,
        `CREATE TABLE IF NOT EXISTS ${dbUtil.tableAppendix.tableName} (`
        + createTableFields.isQuerys[7]
        + `) ${dbUtil.tableAppendix.appendix}`,
        `CREATE TABLE IF NOT EXISTS ${dbUtil.tableAppendix.tableName} (`
        + createTableFields.isQuerys[8]
        + `) ${dbUtil.tableAppendix.appendix}`,
    ]
}

module.exports.querys = {
    is : {
        // is database
        createIS : "CREATE DATABASE IF NOT EXISTS `is`",
        dropIS : "DROP DATABASE IF EXISTS `is`",
        useIS : "USE `is`",

        //
        // truncateIsHubInfo : "TRUNCATE `is`." + `${this.createTableNames.isQuerys[0]}`,
        // truncateIsClusterInfo : "TRUNCATE `is`." + `${this.createTableNames.isQuerys[1]}`,
        // truncateIsKafkaInfo : "TRUNCATE `is`." + `${this.createTableNames.isQuerys[2]}`,
        // truncateIsNodeHwInfo : "TRUNCATE `is`." + `${this.createTableNames.isQuerys[3]}`,
        // truncateIsNodeConsInfo : "TRUNCATE `is`." + `${this.createTableNames.isQuerys[4]}`,
        // truncateIsRevision : "TRUNCATE `is`." + `${this.createTableNames.isQuerys[5]}`,
        // truncateIsReplInfo : "TRUNCATE `is`." + `${this.createTableNames.isQuerys[6]}`,
        // truncateIsRegToken : "TRUNCATE `is`." + `${this.createTableNames.isQuerys[7]}`,
        truncateIsHubInfo : dbUtil.truncate("`is`." + `${this.createTableNames.isQuerys[0]}`),
        truncateIsClusterInfo : dbUtil.truncate("`is`." + `${this.createTableNames.isQuerys[1]}`),
        truncateIsKafkaInfo : dbUtil.truncate("`is`." + `${this.createTableNames.isQuerys[2]}`),
        truncateIsNodeHwInfo : dbUtil.truncate("`is`." + `${this.createTableNames.isQuerys[3]}`),
        truncateIsNodeConsInfo : dbUtil.truncate("`is`." + `${this.createTableNames.isQuerys[4]}`),
        truncateIsRevision : dbUtil.truncate("`is`." + `${this.createTableNames.isQuerys[5]}`),
        truncateIsReplInfo : dbUtil.truncate("`is`." + `${this.createTableNames.isQuerys[6]}`),
        truncateIsRegToken : dbUtil.truncate("`is`." + `${this.createTableNames.isQuerys[7]}`),
        truncateIsSystemInfo : dbUtil.truncate("`is`." + `${this.createTableNames.isQuerys[8]}`),
        
        //
        node_cons_info : {
            //
            insertNodeConsInfo: "INSERT IGNORE INTO is.node_cons_info(subnet_id, ip, p2p_addr, role, state, kafka_idx, hub_code, pubkey) VALUES(?, INET_ATON(?), ?, ?, ?, ?, ?, ?)",
            //
            updateState: "UPDATE is.node_cons_info SET state = ? WHERE ip = INET_ATON(?)",
            updateStateByP2pAddr: "UPDATE is.node_cons_info SET state = ? WHERE p2p_addr like ?",
            //
            selectNodeConsInfo: "SELECT idx, role, ip, p2p_addr FROM is.node_cons_info",
            selectNodeConsInfoByRole: "SELECT idx, role, ip, p2p_addr FROM is.node_cons_info WHERE role = ?",
            selectNodeConsInfoByIp: "SELECT * FROM is.node_cons_info WHERE ip = INET_ATON(?)",
            selectNn0Info: "SELECT ip FROM is.node_cons_info WHERE role = 0 ORDER BY idx ASC LIMIT 1",
            //
            deleteNodeConsInfoByIp: "DELETE FROM is.node_cons_info WHERE ip = INET_ATON(?)",
        }, 
        node_hw_info : {
            insertNodeHwInfo: "INSERT IGNORE INTO is.node_hw_info(subnet_id, ip, join_time, sn_hash, ip_list, lan_speed_list, cpu, hdd_size, hdd_raid, ssd_size, ssd_raid, nvme_size, nvme_raid, mem_size, mem_speed, lan_check, raid_check, virtual_check1, virtual_check2, total_prr) VALUES(?, INET_ATON(?), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            deleteNodeHwInfoByIp: "DELETE FROM is.node_hw_info WHERE ip = INET_ATON(?)"
        }, 
        hub_info : {
            insertHubInfo: "INSERT IGNORE INTO is.hub_info(subnet_id, hub_code, name, latitude, longitude, country, city, hub_p2p_addr) VALUES(?, ?, ?, ?, ?, ?, ?, ?)",
            insertHubInfoWithoutCity: "INSERT IGNORE INTO is.hub_info(subnet_id, hub_code, name, latitude, longitude, country, hub_p2p_addr) VALUES(?, ?, ?, ?, ?, ?, ?)",
            selectHubInfo: "SELECT * FROM is.hub_info",
            selectHubInfoByName: "SELECT latitude, longitude, hub_code FROM is.hub_info WHERE name = ?",
            selectHubInfoByHubCode: "SELECT hub_p2p_addr FROM is.hub_info WHERE hub_code = ?",
        }, 
        revision : {
            insertRevision: "INSERT IGNORE INTO is.revision(subnet_id, update_time, rr_net) VALUES(?, ?, ?)",
            selectRevision: "SELECT idx FROM is.revision",
            selectRevisonCount: "SELECT COUNT(idx) AS count FROM is.revision"
        }, 
        cluster_info : {
            insertClusterInfo: "INSERT IGNORE INTO is.cluster_info(subnet_id, ip, role, sn_hash, cluster_p2p_addr) VALUES(?, INET_ATON(?), ?, ?, ?)",
            selectClusterInfoBySnHash: "SELECT cluster_p2p_addr FROM is.cluster_info WHERE sn_hash = ?",
            selectClusterInfoByIp: "SELECT * FROM is.cluster_info WHERE ip=INET_ATON(?)",
            selectDistinctClusterP2pAddr: "SELECT DISTINCT cluster_p2p_addr FROM is.cluster_info",
            deleteClusterInfoByClusterP2pAddr: "DELETE FROM is.cluster_info WHERE cluster_p2p_addr=?",
            deleteClusterInfoByIp: "DELETE FROM is.cluster_info WHERE ip=INET_ATON(?)"
        }, 
        kafka_info : {
            insertKafkaInfo: "INSERT IGNORE INTO is.kafka_info(subnet_id, broker_list, topic_list) values(?, ?, ?)",
            // insertKafkaInfoWithoutTopicList: "INSERT IGNORE INTO is.kafka_info(subnet_id, broker_list) values(?, ?)",
            selectKafkaInfo: "SELECT idx, broker_list, topic_list FROM is.kafka_info",
            selectKafkaInfoByTopicList: "SELECT idx, broker_list FROM is.kafka_info WHERE topic_list = ?",
            selectKafkaInfoByBrokerList: "SELECT idx FROM is.kafka_info WHERE broker_list = ?",
            // updateTopicListByIdx: "UPDATE is.kafka_info SET topic_list=? WHERE idx=?",
        }, 
        repl_info : {
            //
            insertReplInfo: "INSERT IGNORE INTO is.repl_info(subnet_id, blk_num, ip, role, log_file, log_pos, cluster_p2p_addr) values(?, ?, ?, ?, ?, ?, ?)",
            //
            selectReplInfo: "SELECT * FROM is.repl_info ORDER BY blk_num DESC",
            selectReplInfoByBN: "SELECT * FROM is.repl_info WHERE blk_num = ? ORDER BY blk_num DESC",
            selectReplInfoByBNAndRole: "SELECT * FROM is.repl_info WHERE blk_num = ? and role = ? ORDER BY blk_num DESC",
            selectReplInfoByBNAndRoleAndClusterP2pAddr: "SELECT * FROM is.repl_info WHERE blk_num = ? and role = ? and cluster_p2p_addr = ? ORDER BY blk_num DESC",
            //
            selectMaxReplInfoByBN: "SELECT MAX(blk_num) as max_blk_num FROM is.repl_info WHERE blk_num <= ? ORDER BY blk_num DESC",
            selectMaxReplInfoByBNAndRole: "SELECT MAX(blk_num) as max_blk_num FROM is.repl_info WHERE blk_num <= ? and role = ? ORDER BY blk_num DESC",
            //
            deleteReplInfoByRole: "DELETE FROM is.repl_info WHERE role != ?", 
        }, 
        reg_token : {
            //
            insertRegToken: "INSERT IGNORE INTO is.reg_token(subnet_id, owner_pk, super_pk, logo, action, name, symbol, total_supply, decimal_point) values(?, ?, ?, ?, ?, ?, ?, ? , ?)",
            insertRegTokenWithoutLogo: "INSERT IGNORE INTO is.reg_token(subnet_id, owner_pk, super_pk, action, name, symbol, total_supply, decimal_point) values(?, ?, ?, ?, ?, ?, ? , ?)",
            selectRegTokenByAction : "SELECT * FROM is.reg_token WHERE action = ?",
            selectRegTokenByName : "SELECT * FROM is.reg_token WHERE name = ?",
            selectRegTokenBySymbol : "SELECT * FROM is.reg_token WHERE symbol = ?",
            selectRegTokenByActionNameSymbol : "SELECT * FROM is.reg_token WHERE action = ? or name = ? or symbol = ?",
        }, 
        system_info : {
            insertSystemInfo: "INSERT IGNORE INTO is.system_info(subnet_id, net_info) values(?, ?)",
            updateNetInfoBgStatus: `UPDATE IGNORE is.system_info SET net_info = JSON_SET(net_info, "$.bg_status", ?)`,

            //
            selectCnt : `SELECT COUNT(*) as total_count FROM is.system_info`,
            selectSystemInfo : `SELECT * FROM is.system_info`, 
        },
    },
};

//
const createIsDB = async () => {
    const conn = await dbUtil.getConn();

    await conn.query(this.querys.is.createIS);

    await dbUtil.releaseConn(conn);
}

const dropIsDB = async () => {
    const conn = await dbUtil.getConn();

    await conn.query(this.querys.is.dropIS);

    await dbUtil.releaseConn(conn);
}

const truncateIsAllDB = async () => {
    const conn = await dbUtil.getConn();

    let sql;
    
    sql = this.querys.is.truncateIsClusterInfo;
    await conn.query(sql);

    sql = this.querys.is.truncateIsHubInfo;
    await conn.query(sql);

    sql = this.querys.is.truncateIsKafkaInfo;
    await conn.query(sql);

    sql = this.querys.is.truncateIsNodeHwInfo;
    await conn.query(sql);

    sql = this.querys.is.truncateIsNodeConsInfo;
    await conn.query(sql);

    sql = this.querys.is.truncateIsRevision;
    await conn.query(sql);

    sql = this.querys.is.truncateIsReplInfo;
    await conn.query(sql);

    sql = this.querys.is.truncateIsRegToken;
    await conn.query(sql);

    sql = this.querys.is.truncateIsSystemInfo;
    await conn.query(sql);

    await dbUtil.releaseConn(conn);
}

module.exports.truncateIsTestDB = async () => {
    const conn = await dbUtil.getConn();

    let sql;

    // sql = this.querys.is.truncateIsClusterInfo;
    // await conn.query(sql);

    // sql = this.querys.is.truncateIsHubInfo;
    // await conn.query(sql);

    // sql = this.querys.is.truncateIsKafkaInfo;
    // await conn.query(sql);

    sql = this.querys.is.truncateIsNodeHwInfo;
    await conn.query(sql);

    sql = this.querys.is.truncateIsNodeConsInfo;
    await conn.query(sql);

    sql = this.querys.is.truncateIsRevision;
    await conn.query(sql);

    // sql = this.querys.is.truncateIsReplInfo;
    // await conn.query(sql);

    sql =this.querys.is.repl_info.deleteReplInfoByRole;
    await conn.query(sql, [define.NODE_ROLE.NUM.IS]);

    sql = this.querys.is.truncateIsRegToken;
    await conn.query(sql);

    // sql = this.querys.is.truncateIsSystemInfo;
    // await conn.query(sql);

    await dbUtil.releaseConn(conn);
}

module.exports.truncateIsTestNodeKillDB = async () => {
    const conn = await dbUtil.getConn();

    let sql;

    // sql = this.querys.is.truncateIsClusterInfo;
    // await conn.query(sql);

    // sql = this.querys.is.truncateIsHubInfo;
    // await conn.query(sql);

    // sql = this.querys.is.truncateIsKafkaInfo;
    // await conn.query(sql);

    // sql = this.querys.is.truncateIsNodeHwInfo;
    // await conn.query(sql);

    // sql = this.querys.is.truncateIsNodeConsInfo;
    // await conn.query(sql);

    // sql = this.querys.is.truncateIsRevision;
    // await conn.query(sql);

    // sql = this.querys.is.truncateIsReplInfo;
    // await conn.query(sql);

    sql =this.querys.is.repl_info.deleteReplInfoByRole;
    await conn.query(sql, [define.NODE_ROLE.NUM.IS]);
    
    // sql = this.querys.is.truncateIsRegToken;
    // await conn.query(sql);

    await dbUtil.releaseConn(conn);
}

module.exports.initDatabaseIS = async () => {
    let ret;
    const conn = await dbUtil.getConn();

    try {
        //
        if(config.DB_TEST_MODE_DROP) {
            logger.debug(`querys.is.dropIS : ${this.querys.is.dropIS}`);
            await conn.query(this.querys.dropIS);
        }

        //
        logger.debug(`querys.is.createIS : ${this.querys.is.createIS}`);
        await conn.query(this.querys.is.createIS);

        //
        let sql = this.querys.is.useIS;
        await conn.query(sql);

        //
        await util.asyncForEach(this.createTables.isQuerys, async(element, index) => {
            // logger.debug("element : " + element);
            element = util.stringReplace(element, `${dbUtil.tableAppendix.tableName}`, this.createTableNames.isQuerys[index]);
            element = util.stringReplace(element, `${dbUtil.tableAppendix.appendix}`, dbUtil.tableAppendix.innoDB);
            // logger.debug("isQuerys : " + element);
            await conn.query(element);
        });

        if(config.DB_TEST_MODE) {
            await this.truncateIsTestDB();
        }

        ret = { res : true };
        logger.info(`Database Init - ${createDbNames.is}`);
    } catch (err) {
        // debug.error(err);
        logger.error(`Database Error - ${JSON.stringify(err)}`);
        ret = { res : false, reason : JSON.stringify(err)};
    }

    await dbUtil.releaseConn(conn);

    return ret;
}

