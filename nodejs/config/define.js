//
const config = require('./../config/config.js');

// Define

const ENABLED = true;
const DISABLED = false;

module.exports.ERR_CODE ={
    ERROR : -1,
    SUCCESS : 1
}

module.exports.IP ={
    LOCALHOST : '127.0.0.1',
    EMPTY : '0.0.0.0'
}

module.exports.STR_RTN = {
    TRUE: 'true',
    FALSE: 'false',
    ERROR: 'error'
}

module.exports.DIVISION = {
    LOCALHOST: 'localhost',
    REMOTE_IP: 'remoteIp',
    REMOTE_PORT: 'remotePort',
    LOCAL_IP: 'localIp',
    LOCAL_PORT: 'localPort',
    EMPTY_IP: 'emptyIp',
    EMPTY_PORT: 'emptyPort'
}

module.exports.DB = {
    IDX : 'idx',
    TOTAL_PRR : 'total_prr',
    IP : 'ip'
}

module.exports.NODE_ROLE = {
    STR : {
        NN : 'NN',
        IS : 'IS',
        DBN : 'DBN',
        SCA : 'SCA',
        ISAG: 'ISAg',
    },
    NUM : {
        NN : 0, 
        IS : 1, 
        DBN : 2, 
        ISAG : 4, 
    },
}

module.exports.getRoleInt = (roleStr) => {
    let roleInt = this.ERR_CODE.ERROR;

    if (roleStr === this.NODE_ROLE.STR.NN)
    {
        roleInt = this.NODE_ROLE.NUM.NN;
    }
    else if (roleStr === this.NODE_ROLE.STR.DBN)
    {
        roleInt = this.NODE_ROLE.NUM.DBN;
    }
    else if (roleStr === this.NODE_ROLE.STR.ISAG)
    {
        roleInt = this.NODE_ROLE.NUM.ISAG;
    }

    return roleInt;
}

module.exports.getRoleStr = (roleInt) => {
    let roleStr = '';

    if (roleInt === this.NODE_ROLE.NUM.NN)
    {
        roleStr = this.NODE_ROLE.STR.NN;
    }
    else if (roleInt === this.NODE_ROLE.NUM.DBN)
    {
        roleStr = this.NODE_ROLE.STR.DBN;
    }
    else if (roleInt === this.NODE_ROLE.NUM.ISAG)
    {
        roleStr = this.NODE_ROLE.STR.ISAG;
    }

    return roleStr;
}

module.exports.STATE = {
    ON : 1,
    OFF : 0
}

module.exports.DEFAULT_NET_CONF = {
    TCP_SVR_1_TOTAL_PEERS : 1,
    TCP_SVR_1_TOTAL_PEERS_CONS_1 : 0
}

module.exports.PRR = {
    capacityUnit : {
        GIGA: 1000
    },
    cpuWeight : {
        BASE: 15031,
        RATIO: 1000
    },
    memWeight : {
        BASE: 3999,
        RATIO1: 25,
        RATIO2: 50,
        LOG: 2
    },
    diskWeight : {
        NVME: 6,
        SSD: 3,
        HDD: 1,
        RATIO: 25
    }
}

module.exports.DATA_HANDLER = {
    status_cmd : {
        start : 'start',
        stop : 'stop',
        res_success : 'complete',
        request : 'request',
    }, 
    kind_cmd : {
        status_stop : 'leave all',
        net_update : 'rr update', 
        blk_start : 'rr start',
        blk_stop : 'rr stop',
        last_bn_get : 'lastBN get',
        contract_recv : 'contract recv',
        // add_user : Number((0x10000000).toString(10)),
        // change_id : Number((0x10000001).toString(10)),
        // change_pubkey : Number((0x10000002).toString(10)),
        // login : Number((0x10000005).toString(10)),
        // logout : Number((0x10000006).toString(10)),
    }, 
    repl : 'repl',
    repl_cmd : {
        set : 'set',
        get : 'get',
        reset : 'reset',
        start: 'start',
        stop : 'stop',
        dataReq: 'dataReq',
        dataRsp : 'dataRsp',
    },
    // repl_arg_start : 0,
    // repl_arg_end : 4, // sizeof(repl_set)

    // brc_start : '{',
    // brc_end : '}'
}

module.exports.SOCKET_ARG = {
    SEPARATOR: "\r"
}

module.exports.CRYPTO_ARG = {
    //
    HASH: 'sha256',
    // digest
    HEX: 'hex',
    BASE64: 'base64',
    //
    EDDSA: 'ed25519'
}

module.exports.SEC_DEFINE = {
    HASH_ALGO : "sha256",
    DIGEST : {
        HEX : 'hex',
        BASE64 : 'base64',
    },
    PUBLIC_KEY_LEN : 66,
    CURVE_NAMES : {
        ECDH_SECP256R1_CURVE_NAME : "prime256v1",
        ECDH_SECP256K1_CURVE_NAME : "secp256k1",
        EDDSA_CURVE_NAME : "ed25519",
        ECDSA_SECP256K1_CURVE_NAME : "secp256k1",
        ECDSA_SECP256R1_CURVE_NAME : "p256"
    },
    KEY_DELIMITER : {
        START_INDEX : 0,
        END_INDEX : 2,
        DELIMITER_LEN : 2,
        SECP256_COMPRESSED_EVEN_DELIMITER : "02",
        SECP256_COMPRESSED_ODD_DELIMITER : "03",
        SECP256_UNCOMPRESSED_DELIMITER : "04",
        ED25519_DELIMITER : "05",
    },
    SIGN : {
        R_START_INDEX : 0,
        R_LEN : 64,
        S_START_INDEX : 64,
        S_END_INDEX : 64
    },
    SIG_KIND : {
        ECDSA : "ECDSA",
        EDDSA : "EDDSA"
    },
    CONVERT_KEY : {
        COMPRESSED : "compressed",
        UNCOMPRESSED : "uncompressed"
    },
    KEY_PURPOSE : {
        NET : "net",
        WALLET : "wallet"
    }
}

module.exports.CMD = {
    encoding:           'utf8',
    success:            ' Command Success',
    error:              ' Command Error',
    help_req1:          'is --help',
    help_req2:          '-h',
    version_req1:       'is --version',
    version_req2:       '-v',
    net_reset_req1:     'is --net reset',
    net_reset_req2:     '-nrst',
    net_make_req1:      'is --net make',
    net_make_req2:      '-nmk',
    net_save_req1:      'is --net save',
    net_save_req2:      '-nsv',
    net_update_req1:    'is --net update',
    net_update_req2:    '-nup',
    net_rerun_req1:     'is --net rerun',
    net_rerun_req2:     '-nrr',
    net_init_req1:      'is --net init',
    net_init_req2:      '-nini',
    node_start_req1:    'is --node start',
    node_start_req2:    '-nstt',
    node_kill_req1:     'is --node kill',
    node_kill_req2:     '-nkil',
    node_next_req1:     'is --net next',
    node_next_req2:     '-nnxt',
    bg_start_req1:      'is --block gen start',
    bg_start_req2:      '-bgstt',
    bg_stop_req1:       'is --block gen stop',
    bg_stop_req2:       '-bgstop',
    bg_restart_req1:    'is --block gen restart',
    bg_restart_req2:    '-bgrstt',
    last_bn_req1:       'is --get last bn',
    last_bn_req2:       '-lbn',
    db_act_query_req1:  'is --act query',
    db_truncate_test_req1: 'is --db truncate test',
    db_truncate_test_req2: '-dtt',
    db_truncate_remote_req1: 'is --db truncate test',
    db_truncate_remote_req2: '-dtr',
    db_truncate_req1:   'is --db truncate',
    db_truncate_req2:   '-dt',
    db_repl_saveis1:    'is --db repl saveis',
    db_repl_saveis2:    '-rsaveis',
    db_repl_get1:       'is --db repl get',
    db_repl_get2:       '-rget',
    db_repl_set1:       'is --db repl set',
    db_repl_set2:       '-rset',
    db_repl_stop1:      'is --db repl stop',
    db_repl_stop2:      '-rstop',
    db_repl_reset1:     'is --db repl reset',
    db_repl_reset2:     '-rrst',
    db_repl_start1:     'is --db repl start',
    db_repl_start2:     '-rstt',
    repl_data_get1:     'is --repl data get',
    repl_data_reset1:   'is --repl data reset',
    shard_user_add1:    'is --shard user add',
    shard_user_del1:    'is --shard user del',
    hub_add_req1:       'is --hub add',
    hub_add_option1:    '-hubcode',
    hub_add_option2:    '-name',
    hub_add_option3:    '-gps',
    hub_add_option4:    ',',
    cluster_add_req1:   'is --cluster add',
    cluster_add_option1:'-hubcode',
    cluster_add_option2:'-group',
    cluster_add_option3:'-ip',
    cluster_add_option4:'-role',
    cluster_add_option5:'-sn',
    // cluster_add_option6:'-pubkey',
    cluster_del_req1:   'is --cluster del',
    cluster_del_option1:'-p2p',
    cluster_rep1:       'success',
    cluster_rep2:       'fail',
    kafka_add_req1:     'is --kafka add',
    kafka_add_option1:  '-hubcode',
    kafka_add_option2:  '-group',
    kafka_add_option3:  '-broker',
    kafka_init_req1:    'is --kafka init',
    kafka_init_req2:    '-kini',
    kafka_get_req1:    'is --kafka get',
    kafka_get_req2:    '-kget',
    kafka_del_req1:    'is --kafka del',
    kafka_del_req2:    '-kdel',
    token_add_req1:     'is --token add',
    token_del_req1:     'is --token del',
    token_add_option1:  '-owner_pk',
    token_add_option2:  '-super_pk',
    token_add_option3:  '-logo',
    token_add_option4:  '-action',
    token_add_option5:  '-name',
    token_add_option6:  '-symbol',
    token_add_option7:  '-total_supply',
    token_add_option8:  '-decimal_point',
    //
    sysinfo_init_req1:  'is --sysinfo init',

    //
    cpu_add_req1:       'is --cpu add',
    cpu_add_option1:    '-name',
    cpu_add_option2:    '-mark',
    db_passwd_req1:     'mysql passwd',
    key_crypt_req:      'key',
    genesis_req1:       'is --genesis contract',
    genesis_req2:       '-g',
    gc_add_user_is1:    'is --gc add user is',
    gc_add_user_is2:    '-gc aui',
    gc_crate_token1:    'is --gc create token',
    gc_crate_token2:    '-gc ct',
    gc_crate_token_k1:  'is --gc create tokenk',
    gc_crate_token_k2:  '-gc ctk',
    ip_list1:           'is --ip list',
    ip_list2:           '-ips',
    test1:              'is --test',
    test2:              '-t',
    testContract:       'is --tc',

    //
    help_res:   '               *******************************************\n' +
                '               ****          **************         ******\n' +
                '               ******      *************              ****\n' +
                '               ******      ************     **************\n' +
                '               ******      ************     **************\n' +
                '               ******      *************             *****\n' +
                '               ******      *********************      ****\n' +
                '               ******      *********************      ****\n' +
                '               ******      ***********               *****\n' +
                '               ****          ***********          ********\n' +
                '               *******************************************\n' +
                '       Usage : is --<command> <option>\n' +
                '       \n' +
                '       a.  is --version / is -v : Show version of IS\n' +
                '       b.  is --kafka add <broker_list> : Add Kafka List\n' +
                '          > Example : is --kafka add 125.141.130.11:9092,125.141.130.12:9092,125.141.130.13:9092\n' +
                '       c.  is --hub add -hubcode < > -name < > -gps < , > : Add Hub List\n' +
                '          > Example : is --hub add -hubcode 1 -name Seoul_Dogok1_01 -gps 37.63,127.03\n' +
                '       d.  is --cluster add -hubcode < > -group < > -ip < > -pubkey < > -sn < > : Add Cluster List\n' +
                '          > Example : is --cluster add -hubcode 0 -group 0 -ip 203.238.181.172 -pubkey 6c51bdb36... -sn 74b5b608...\n' +
                '       e.  1) is --cluster del -p2p < > : Delete Cluster List (P2P_address)\n' +
                '           2) is --cluster del -ip < > : Delete Cluster List (IP)\n' +
                '          > Example(1) : is --cluster del -p2p 0x253f7f036004\n' +
                '          > Example(2) : is --cluster del -ip 192.168.0.11\n' +
                '       f.  mysql passwd < > : Encrypt Mysql Passwd by AES\n' +
                '          > Example : mysql passwd 123456\n' +
                '       g.  key enc/dec < > : Encrypt Eddsa Private Key by AES\n' +
                '          > Example : key enc ../conf/key/me/ed_privkey.pem\n' +
                '          > Example : key dec ../conf/key/me/ed_privkey.fin\n' +
                '       \n' +
                '       0.  is --net reset : Reset network\n' +
                '       1.  is --net rerun : Each node applies a new NODE.json\n' +
                '       2.  is --net update : Each node applies new rr_net.json, rr_subnet.json\n' +
                '       3.  is --node start : Start All nodes. (CN start after 3sec)\n' +
                '       4.  is --block gen start : Start Block gen\n' +
                '       5.  is --block gen stop : Stop Block gen\n' +
                '       6.  is --db truncate : Each node truncates DB\n' +
                '       7.  is --net next : The nodes in the Consensus group are trying to connect to each other.\n' +
                '       8.  is --node kill : Kill All nodes\n' +
                '       9.  is --net init : Each node closes TCP connection\n' +
                '       10. is --genesis contract / is -g : Send Genesis Contract to SCA0\n' +
                '\n',
    version_res:            '       ' + config.VERSION_INFO,
    error_res:              'Command not found. Please enter the [is -h] or [is --help]',

    // To ISA & ISAG
    // Request
    req_reset:              'leave all',
    req_rerun:              're run',
    req_rr_update:          'rr update',
    req_net_init:           're init',
    req_node_start:         'node start',
    req_node_kill:          'node kill',
    req_rr_next:            'rr next',
    req_bg_start:           'rr start',
    req_bg_stop:            'rr stop',
    req_last_bn:            'last bn',
    req_net_save:           'net save',
    req_contract_txs:       'contract txs',
    req_bg_restart:         'rr restart',
    req_db_truncate:        'db truncate',
    req_db_repl_set:        'repl set',
    req_db_repl_get:        'repl get',
    req_db_repl_stop:       'repl stop',
    req_db_repl_reset:      'repl reset',
    req_db_repl_start:      'repl start',
    req_db_repl_dataReq:    'repl dataReq',
    req_db_repl_dataRsp:    'repl dataRsp',
    req_contract_test:      'contract test',
    req_contract_chk:       'contract chk',
    req_node_info_exist:    'node info exist',
    // Response
    rsp_prr_error:          'prr error',
    rsp_prr_passed:         'prr passed',
    rsp_prr: 'prr',
    rsp_prr_cmd : {
        err : 'error',
        passed : 'passed'
    },

    // CLI
    rep_db_passwd_success:  'Maria Passwd Encrypt Success',
    rep_db_passwd_error:    'Maria Passwd Encrypt Error',
    rep_ed_prikey_success:  'Eddsa Private Key Encrypt Success',
    rep_ed_prikey_error:    'Eddsa Private Key Encrypt Error',
}

module.exports.CONTRACT_DEFINE = {
    ED_PUB_IDX : '05',
    MAX_TX_CNT : 500,
    ACCOUNT_TOKEN_DELI : 1,
    ACCOUNT_USER_DELI_MIN : 2,
    ACCOUNT_USER_DELI_MAX : 7,
    MILLI_DECIMAL_POINT : 3,
    MICRO_DECIMAL_POINT : 6,
    NANO_DECIMAL_POINT : 9,
    MAX_DECIMAL_POINT : 9, // 4
    SEC_TOKEN_ACCOUNT : '1000000000000000',
    FROM_DEFAULT : '0000000000000000',
    TO_DEFAULT : '0000000000000000',
    FEE_DEFAULT : '0',
    ACTIONS : {
        // TOKEN
        TOKEN : {
            //
            SECURITY_TOKEN : config.CONTRACT_ACTIONS_JSON.TOKEN.SECURITY,
            // 
            UTILITY_TOKEN_PLATINUM_MAX : config.CONTRACT_ACTIONS_JSON.TOKEN.UTILITY_PLATINUM.END,
            UTILITY_TOKEN_GOLD_MAX : config.CONTRACT_ACTIONS_JSON.TOKEN.UTILITY_GOLD.END,
            UTILITY_TOKEN_MAX : config.CONTRACT_ACTIONS_JSON.TOKEN.UTILITY.END,
        },  
        
        // CONTRACT
        CONTRACT : {
            // DEFAULT
            DEFAULT : {
                TOKEN_CREATION : config.CONTRACT_ACTIONS_JSON.CONTRACT.DEFAULT.TOKEN_CREATION,
                EXE_FUNC : config.CONTRACT_ACTIONS_JSON.CONTRACT.DEFAULT.EXE_FUNC,
                CHANGE_TOKEN_PUBKEY : config.CONTRACT_ACTIONS_JSON.CONTRACT.DEFAULT.CHANGE_TOKEN_PUBKEY,
                TOKEN_TX : config.CONTRACT_ACTIONS_JSON.CONTRACT.DEFAULT.TOKEN_TX,
        
                LOCK_TOKEN_TX : config.CONTRACT_ACTIONS_JSON.CONTRACT.DEFAULT.LOCK_TOKEN_TX,
                LOCK_TOKEN_TIME : config.CONTRACT_ACTIONS_JSON.CONTRACT.DEFAULT.LOCK_TOKEN_TIME,
                LOCK_TOKEN_WALLET : config.CONTRACT_ACTIONS_JSON.CONTRACT.DEFAULT.LOCK_TOKEN_WALLET,
        
                // 
                ADD_USER : config.CONTRACT_ACTIONS_JSON.CONTRACT.DEFAULT.ADD_USER, 
                CHANGE_USER_PUBKEY : config.CONTRACT_ACTIONS_JSON.CONTRACT.DEFAULT.CHANGE_USER_PUBKEY, 
        
                //
                CREATE_SC : config.CONTRACT_ACTIONS_JSON.CONTRACT.DEFAULT.CREATE_SC, 
            }, 

            // PURI
            PURI : {
                STT : config.CONTRACT_ACTIONS_JSON.CONTRACT.PURI.STT, 
                END : config.CONTRACT_ACTIONS_JSON.CONTRACT.PURI.END, 
            }, 

            // SC
            SC : {
                STT : config.CONTRACT_ACTIONS_JSON.CONTRACT.SC.STT, 
                END : config.CONTRACT_ACTIONS_JSON.CONTRACT.SC.END,
            }, 
        }, 
        
        // NOTICE
        NOTICE : {
            STT : config.CONTRACT_ACTIONS_JSON.NOTICE.STT, 
            END : config.CONTRACT_ACTIONS_JSON.NOTICE.END, 
        }, 

        NONE : config.CONTRACT_ACTIONS_JSON.NOTICE.END, 
    },
    FINTECH : {
        NON_FINANCIAL_TX : '0',
        FINANCIAL_TX : '1',
    },
    PRIVACY : {
        PUBLIC : '0',
        PRIVATE : '1'
    },
    CONTRACT_PROPERTY : {
        REVISION : "revision",
        PREV_KEY_ID : "prev_key_id",
        CREATE_TM : "create_tm",
        FINTECH : "fintech",
        PRIVACY : "privacy",
        FEE : "fee",
        FROM_ACCOUNT : "from_account",
        TO_ACCOUNT : "to_account",
        ACTION : "action",
        CONTENTS : "contents",
        MEMO : "memo",
        SIG : "sig",
        SIGNED_PUPKEY : "signed_pubkey"
    },
    CONTENTS_PROPERTY : {
        TX : {
            DST_ACCOUNT : "dst_account", 
            AMOUNT : "amount"
        }, 
        TX_ST : {
            AMOUNT : "amount"
        }, 
        TX_UT : {
            DST_ACCOUNT : "dst_account", 
            AMOUNT : "amount"
        }, 
        TOKEN_TX : {
            ACTION : "action",
            DST_ACCOUNT : "dst_account", 
            AMOUNT : "amount"
        }, 
        LOCK_TOKEN_TX : {
            ACTION : "action",
            LOCK : "lock"
        }, 
        LOCK_TOKEN_TIME : {
            ACTION : "action",
            LOCK_TIME_FROM : "lock_time_from",
            LOCK_TIME_TO : "lock_time_to"
        }, 
        LOCK_TOKEN_WALLET : {
            ACTION : "action",
            PK_LIST : "pk_list"
        }, 
        ADD_USER : {
            OWNER_PK : "owner_pk",
            SUPER_PK : "super_pk",
            ACCOUNT_ID : "account_id"
        }, 
        CHANGE_USER_PK : {
            OWNER_PK : "owner_pk",
            SUPER_PK : "super_pk",
            ACCOUNT_ID : "account_id"
        }, 
        CREATE_TOKEN : {
            OWNER_PK : "owner_pk",
            SUPER_PK : "super_pk",
            ACTION : "action",
            NAME : "name", 
            SYMBOL : "symbol",
            TOTAL_SUPPLY : "total_supply",
            DECIMAL_POINT : "decimal_point",
            LOCK_TIME_FROM : "lock_time_from",
            LOCK_TIME_TO : "lock_time_to",
            LOCK_TRANSFER : "lock_transfer",
            BLACK_LIST : "decimal_point",
            FUNC : "functions"
        }, 
        CHANGE_TOKEN_PK : {
            OWNER_PK : "owner_pk",
            SUPER_PK : "super_pk",
            ACTION : "action"
        }, 
        CREATE_SC : {
            SC_ACTION : "sc_action",
            ACTION_TARGET : "action_target",
            SC : "sc"
        }
    },
    LOCK_TOKEN_TX : {
        UNLOCK : 0,
        LOCK_ALL : 1,
        LOCK_EXC_OWNER : 2
    },
    LOCK_TOKEN_TIME : {
        UNLOCK : "0"
    }
}

module.exports.START_MSG = "=================================================="
    + "\n= FINL Block Chain                               ="
    + "\n= [ IS Ver : " + config.VERSION_INFO + "]                             ="
    + "\n==================================================";

module.exports.REGEX = {
    NEW_LINE_REGEX: /\n+/, 
    WHITE_SPACE_REGEX: /\s/, 
    IP_ADDR_REGEX: /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$/, 
    HASH_REGEX: /^[a-z0-9+]{5,65}$/, 
    HEX_STR_REGEX: /^[a-fA-F0-9]+$/, 
    // ID_REGEX: /^(?=.*[A-Z])(?!.*[a-z])(?!.*[\s()|!@#\$%\^&\*])(?=.{4,})/, 
    ID_REGEX: /^([A-Z0-9_]){4,20}$/,
    PW_STRONG_REGEX : /^([a-zA-Z0-9!@$%^~*+=_-]){10,}$/, 
    PW_STRONG_COND_REGEX : /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?!.*[])(?=.*[!@$%^~*+=_-]).{10,}$/, 
    // PW_STRONG_COND_REGEX : /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?!.*[~#&()<>?:{}])(?=.*[!@$%^~*+=_-]).{10,}$/, 
    PW_MEDIUM_REGEX : /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/, 
    FINL_ADDR_REGEX: /^(FINL){1}[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{1, }$/, 
    PURE_ADDR_REGEX: /^(PURE){1}[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{1, }$/
}

module.exports.COMMON_DEFINE = {
    PADDING_DELIMITER : {
        FRONT : 0,
        BACK : 1
    },
    ENABLED : ENABLED,
    DISABLED : DISABLED
}

//
module.exports.DB_DEFINE = {
    HEX_DB_KEY_LEN : {
        KEY_NUM_LEN : 12,
        KEY_INDEX_LEN : 4,
        DB_KEY_LEN : 16
    },
    REPL_QUERY_INDEX : {
        DROP_USER_INDEX : 0,
        CREATE_USER_INDEX : 1,
        GRANT_REPL_INDEX : 2
    },
    SHARD_USERS_QUERY_INDEX : {
        DROP_USER_INDEX : 0,
        CREATE_USER_INDEX : 1,
        GRANT_ALL_INDEX : 2
    },
}

module.exports.P2P_DEFINE = {
    P2P_SUBNET_ID_IS : '0001',
    P2P_CLUSTER_ID_IS : '0x000000000001',
    P2P_LEN : 14, // 0x123456789ABC
    P2P_ROOT_SPLIT_INDEX : {
        START : 10,
        END : 14
    },
    P2P_TOPIC_NAME_SPLIT_INDEX : {
        START : 2,
        END : 14
    }, 
    P2P_GPS_DECIMAL_POINT : 2
}

module.exports.KFK_DEFINE = {
    KFK_SUBNET_TOPIC_NUM : 7
}
