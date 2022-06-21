//
const fs = require('fs');
const { loggers } = require('winston');

//
const cryptoSsl = require("./../../../addon/crypto-ssl");

//
const NETCONF_JSON = JSON.parse(fs.readFileSync("./../../conf/netconf.json"));

//
module.exports.KEY_PATH = {
    ED_PRIKEY_NAME : NETCONF_JSON.KEY.NAME.ED_PRIKEY, 
    ED_PUBKEY_NAME : NETCONF_JSON.KEY.NAME.ED_PUBKEY, 
    MY_KEY : NETCONF_JSON.DEF_PATH.KEY_ME + '/', 
    PW_SEED: NETCONF_JSON.DEF_PATH.PW_DB_ME + '/' + NETCONF_JSON.DB.PW.NAME.SEED, 
    PW_MARIA : NETCONF_JSON.DEF_PATH.PW_DB_ME + '/' + NETCONF_JSON.DB.PW.NAME.MARIA, 
    PW_SHARD : NETCONF_JSON.DEF_PATH.PW_DB_ME + '/' + NETCONF_JSON.DB.PW.NAME.SHARD, 
    PW_REPL_IS : NETCONF_JSON.DEF_PATH.PW_DB_ME + '/' + NETCONF_JSON.DB.PW.NAME.REPL_IS, 
}

//
module.exports.INFO_PATH = {
    KEY_SEED : cryptoSsl.aesDecPw(this.KEY_PATH.PW_SEED, this.KEY_PATH.PW_MARIA), 
}

module.exports.TEST_PATH = {
    TEST_SEED : NETCONF_JSON.TEST.PATH.SEED + '/' + NETCONF_JSON.TEST.NAME.SEED, 
    TEST_KEY : NETCONF_JSON.TEST.PATH.KEY, 
    ED_01 : NETCONF_JSON.TEST.PATH.KEY + '/ed_01/', 
    ED_02 : NETCONF_JSON.TEST.PATH.KEY + '/ed_02/', 
    ED_03 : NETCONF_JSON.TEST.PATH.KEY + '/ed_03/', 
    ED_04 : NETCONF_JSON.TEST.PATH.KEY + '/ed_04/', 
    PRIKEY_NAME : NETCONF_JSON.TEST.NAME.ED_PRIKEY, 
    PUBKEY_NAME : NETCONF_JSON.TEST.NAME.ED_PUBKEY, 
}

module.exports.CFG_PATH = {
    CONTRACT_ACTIONS : NETCONF_JSON.DEF_INFO.CONTRACT_ACTIONS, 
    NODE_CFG : NETCONF_JSON.DEF_INFO.NODE_CFG, 
    MARIA : {
        DB_HOST : NETCONF_JSON.DB.MARIA.HOST, 
        DB_PORT : NETCONF_JSON.DB.MARIA.PORT, 
        DB_USER : NETCONF_JSON.DB.MARIA.USER, 
        PW_MARIA : cryptoSsl.aesDecPw(this.KEY_PATH.PW_SEED, this.KEY_PATH.PW_MARIA),
        REPL_USERS : [
            NETCONF_JSON.DB.REPL.USER_IS, 
        ], 
        REPL_USERS_PW : [
            cryptoSsl.aesDecPw(this.KEY_PATH.PW_SEED, this.KEY_PATH.PW_REPL_IS), 
        ], 
        SHARD_USERS : [
            NETCONF_JSON.DB.SHARD.USER_IS,
        ],
        SHARD_USERS_PW : [
            cryptoSsl.aesDecPw(this.KEY_PATH.PW_SEED, this.KEY_PATH.PW_SHARD),
        ],
    },
}

module.exports.SOCKET_INFO = {
    BIND_ISA_SERVER_PORT : NETCONF_JSON.IS.SOCKET.ISA.SERVER.PORT, 
    BIND_ISAG_SERVER_PORT : NETCONF_JSON.IS.SOCKET.ISAG.SERVER.PORT, 
    RR_NET_PORT : NETCONF_JSON.IS.SOCKET.RRNET_PORT, 
    RR_NET_SRC_PORT : NETCONF_JSON.IS.SOCKET.RRNET_SRC_PORT, 
}

module.exports.NET_CONF_PATH = {
    RR_NET : 'netconfig/rr_net',
    NODE_NN : 'netconfig/node_nn',
    JSON : '.json'
}

module.exports.CONTRACT_ACTIONS_JSON = JSON.parse(fs.readFileSync(this.CFG_PATH.CONTRACT_ACTIONS));

module.exports.MARIA_CONFIG = {
    host: this.CFG_PATH.MARIA.DB_HOST,
    port: this.CFG_PATH.MARIA.DB_PORT,
    user: this.CFG_PATH.MARIA.DB_USER,
    password: this.CFG_PATH.MARIA.PW_MARIA,
    // database: ...
    supportBigNumbers: true,
    bigNumberStrings: true,
    connectionLimit : 10
};

// network key
module.exports.MY_KEY_PATH_CONFIG = {
    prikey : this.KEY_PATH.MY_KEY + this.KEY_PATH.ED_PRIKEY_NAME,
    pubkey : this.KEY_PATH.MY_KEY + this.KEY_PATH.ED_PUBKEY_NAME
}

// Kafka
// module.exports.kafkaConfig = {
//     'group.id' : NETCONF_JSON.KAFKA.GROUP_ID_ADMIN,
//     // 'metadata.broker.list': NETCONF_JSON.KAFKA.BROKER_LIST,
//     'session.timeout.ms' : 10000,
//     'heartbeat.interval.ms' : 3000,
//     'max.poll.interval.ms' : 500000,
//     'auto.offset.reset' : 'smallest',
//     'offset_commit_cb' : function (err, topicPartitions) {
//         if (err) {
//             logger.error(err);
//         } else {
//             logger.debug(topicPartitions);
//         }
//     }
// }

// 
module.exports.NET_CONF_SET = {
    TIER_NUM: 1,
    GEN_INTERVAL: 4000,
    GEN_SUB_INTRVL: 500,
    GEN_ROUND_CNT: 1,
    CLUSTER_MAX: 21,
    UDP_SVR: 0,
    UDP_CLI: 0,
    TCP_SVR_NN: 1,
    TCP_CLI_0: 0,
    TCP_CLI : 1,
    AUTO_JOIN_NN: 0,
    P2P_JOIN_NN: 1,
    MAX_GRP: 3,
}

// Version info
module.exports.paddy = (num, padLen, padChar) => {
    var pad_char = typeof padChar !== 'undefined' ? padChar : '0';
    var pad = new Array(1 + padLen).join(pad_char);

    return (pad + num).slice(-pad.length);
}

const getVerInfo = () => {
    //
    let mainVerInfo = '0';
    let subVerInfo = '0';

    //
    let lineArr = fs.readFileSync(this.CFG_PATH.NODE_CFG).toString().split('\n');

    for (idx in lineArr)
    {
        if (lineArr[idx].includes('VER_INFO_MAIN'))
        {
            mainVerInfo = lineArr[idx].split(' ')[2];
        }
        else if (lineArr[idx].includes('VER_INFO_SUB'))
        {
            subVerInfo = lineArr[idx].split(' ')[2];
        }
    }

    let verInfo = mainVerInfo + '.' + this.paddy(subVerInfo, 4);

    return verInfo;
}

//
module.exports.VERSION_INFO = getVerInfo();

//
module.exports.CMD_ENCODING = {
    encoding: 'utf8'
}

// testmode=false : disable, testmode=true : enable
module.exports.DB_TEST_MODE = false;
module.exports.DB_TEST_MODE_DROP = false;

// IP Control
module.exports.IP_ASSIGN = {
    CTRL : 0,
    DATA : 1,
    REPL : 1
};

