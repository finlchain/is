const config = require('../../config/config.js');
const mariaAddon = require('../../../addon/build/Release/MariaAddon');
const Addonquery = mariaAddon.MariaQuery;
const logger = require('../utils/logger.js');

const user = config.mariaConfig.user;
const passwd = config.mariaConfig.password;

module.exports.node_info = {
    querys: {
        insert_node_info: "insert_node_info",
        set_role: "set_role",
        set_nn: "set_nn",
        set_dbn: "set_dbn",
        state_update_start: "state_update_start",
        state_update_stop: "state_update_stop",
        state_update_stop_cluster: "state_update_stop_cluster",
        node_list: "node_list",
        nn_list: "nn_list",
        cluster: "cluster",
        nn_ip_info: "nn_ip_info",
        all_ip_info: "all_ip_info",
        dn_ip_info: "dn_ip_info",
        dbn_ip_info: "dbn_ip_info",
        sca0_ip_info: "sca0_ip_info",
        nn_idc_info: "nn_idc_info",
        all_list_info: "all_list_info",
        node_count: "node_count",
        group_count: "group_count",
        wallet_list: "wallet_list",
        master_wallet_list: "master_wallet_list",
        reward_list: "reward_list"
    }
}

module.exports.hw_info = {
    querys: {
        insert_hw_info: "insert_hw_info",
        cpu_mark_point: "cpu_mark_point"
    }
}

module.exports.idc_info = {
    querys: {
        total_idc_list: "total_idc_list",
        idc_list_from_code: "idc_list_from_code",
        gps_code_hub: "gps_code_hub",
        designated_idc: "designated_idc",
        designated_idc2: "designated_idc2",
        add_hub: "add_hub",
        add_hub_nocity: "add_hub_nocity",
        gps_for_cluster: "gps_for_cluster"
    }
}

module.exports.revision = {
    querys : {
        idx: "idx",
        net_reset: "net_reset",
        reset_count: "reset_count"
    }
}

module.exports.cluster_info = {
    querys : {
        cluster_p2p_addr: "cluster_p2p_addr",
        cluster_p2p_addr_list: "cluster_p2p_addr_list",
        cluster_add: "cluster_add",
        clsuter_del_p2p: "cluster_del_p2p",
        cluster_del_ip: "cluster_del_ip"
    }
}

module.exports.genesisContract = {
    querys : {
        hw_id_list: "hw_id_list",
        ip_from_id: "ip_from_id",
        snHash_from_ip: "snHash_from_ip"
    }
}

module.exports.kafka_info = {
    querys : {
        add_broker_list: "add_broker_list",
        idx_from_broker: "idx_from_broker",
        kafka_list: "kafka_list",
        update_topic_list: "update_topic_list",
        kafka_info: "kafka_info"
    }
}

module.exports.queryPre = async (kind, arg) => {
    return await Addonquery(user, passwd, kind, arg);
}

module.exports.query = async (kind) => {
    return await Addonquery(user, passwd, kind);
}

module.exports.truncate = async () => {
    let result = await Addonquery(user, passwd, "truncate");
    if(result == "success")
        logger.info('[DB] DB Init for Test Success');
    else
        logger.info('[DB] DB Init for Test fail');
}

module.exports.resetDB = async () => {
    let result = await Addonquery(user, passwd, "reset");
    if (result == "success")
        logger.info('[DB] DB Reset Success');
    else
        logger.info('[DB] DB Reset fail');
}