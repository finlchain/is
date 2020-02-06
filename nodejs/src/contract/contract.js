const config = require('../../config/config.js');
const define = require('../../config/define.js');
const cryptoutil = require('../sec/cryptoutil.js');
const common = require('../utils/common.js');
const dbutil = require('../db/dbutil.js');
const logger = require('../utils/logger.js');
const fbapi = require('../api/FBapi.js');
const fs = require('fs');
const gc_define = define.genesisContract;

module.exports.genesisContract = async function(){
    let note = new Array();
    await addUserIS(note);
    await addUserNode(note);
    await addHW(note);
    await netConf(note);
    await addKafka(note);
    await addRewardPolicy(note);
    let genesis_object = await genesisObject(note);

    return genesis_object;
}

module.exports.rewardContract = async function() {
    let note = new Array();
    await clusterWallet(note);
    const reward_object = await rewardObject(note);
    
    return reward_object;
}

async function statusIS() {
    let api_req_argv;
    api_req_argv = {
        "pubkey" : define.genesisContract.ed_pub_idx + await cryptoutil.PEM_pubkey_read(config.keypath.my_key + config.keypath.ed_pubkey_name),
        "kind" : 0
    }
    let fb_url = config.FBURL + "/account/status";
    let api_res = await fbapi.APICall_GET(fb_url, api_req_argv);
    return api_res;
}

async function clusterWallet(note) {
    let cluster_master_addr_list = await JSON.parse(await dbutil.queryPre(dbutil.node_info.querys.master_wallet_list, [define.nodeRole.NN]));
    await common.asyncForEach(cluster_master_addr_list.w_public_key, async (element, index) => {
        rewardNote = {
            "To" : define.genesisContract.ed_pub_idx + element,
            "Fee" : (parseFloat(config.rewardAmount) * config.rewardFeeRatio).toString(),
            "Kind" : config.securityCoinKind,
            "Content" : {
                "Amount" : config.rewardAmount
            },
            "Date": await common.timeStampSEC()
        }
        note.push(rewardNote);
    });
}

async function addUserIS(note){
    addUserNote = {
        "To": gc_define.To,
        "Fee": gc_define.Fee,
        "Kind": gc_define.Kind.add_user,
        "Content":{
            "ID": gc_define.ID,
            "PublicKey": define.genesisContract.ed_pub_idx + await cryptoutil.PEM_pubkey_read(config.keypath.my_key + config.keypath.ed_pubkey_name)
        },
        "Date": await common.timeStampSEC()
    }
    note.push(addUserNote);
}

async function addUserNode(note){
    let node_info = await JSON.parse(await dbutil.query(dbutil.genesisContract.querys.hw_id_list));
    for (var i = 0; i < node_info.id.length; i++) {
        addUserNodeNote = {
            "To": gc_define.To,
            "Fee": gc_define.Fee,
            "Kind": gc_define.Kind.add_user,
            "Content": {
                "ID": node_info.id[i] + "_w",
                "PublicKey": node_info.w_public_key[i].length === 64 ? define.genesisContract.ed_pub_idx + node_info.w_public_key[i] : node_info.w_public_key[i]
            },
            "Date": await common.timeStampSEC()
        }
        await note.push(addUserNodeNote);
    }
}

async function addHW(note){
    let node_info = await JSON.parse(await dbutil.query(dbutil.genesisContract.querys.hw_id_list));
    let addHWNote = {};
    for (var i = 0; i < node_info.public_key.length; i++){
        // let ipForMatch = await JSON.parse(dbutil.queryPre(dbutil.genesisContract.querys.ip_from_id, [node_info.id[i]]));
        let nodeHWSN = await JSON.parse(await dbutil.queryPre(dbutil.genesisContract.querys.snHash_from_ip, [node_info.ip[i]]));
        addHWNote = {
            "To": gc_define.To,
            "Fee": gc_define.Fee,
            "Kind": gc_define.Kind.add_hw,
            "Content": {
                "ID": node_info.id[i],
                "PublicKey": define.genesisContract.ed_pub_idx + node_info.public_key[i],
                "IP": node_info.ip[i],
                "P2P_Address" : node_info.p2p_addr[i],
                "HWSN": nodeHWSN.sn_hash[0]
            },
            "Date": await common.timeStampSEC()
        };
        await note.push(addHWNote);
    }
}

async function netConf(note){
    let files = fs.readdirSync(gc_define.netconf_path);
    let rrnetNote = {};
    let rrsubnetNote = {};
    let nodeJsonNote = {};
    for( var i = 0; i < files.length; i ++){
        let file = files[i];
        if(file.slice(0, 4) == gc_define.idx_rrnet){
            let rrnetContent = JSON.parse(await fs.readFileSync(gc_define.netconf_file_path+file, gc_define.type));
            rrnetNote = {
                "To": gc_define.To,
                "Fee": gc_define.Fee,
                "Kind": gc_define.Kind.rr_net,
                "Content": JSON.stringify(rrnetContent),
                "Date": await common.timeStampSEC()
            }
            await note.push(rrnetNote);
        }
        else if(file.slice(0, 4) == gc_define.idx_rrsubnet){
            let rrsubnetContent = JSON.parse(await fs.readFileSync(gc_define.netconf_file_path + file, gc_define.type));
            rrsubnetNote = {
                "To": gc_define.To,
                "Fee": gc_define.Fee,
                "Kind": gc_define.Kind.rr_sub_net,
                "Content": JSON.stringify(rrsubnetContent),
                "Date": await common.timeStampSEC()
            }
            await note.push(rrsubnetNote);
        }
        else if(file.slice(0, 4) == gc_define.idx_node){
            let nodeJsonContent = JSON.parse(await fs.readFileSync(gc_define.netconf_file_path + file, gc_define.type));
            nodeJsonNote = {
                "To": gc_define.To,
                "Fee": gc_define.Fee,
                "Kind": gc_define.Kind.node_json,
                "Content": JSON.stringify(nodeJsonContent),
                "Date": await common.timeStampSEC()
            }
            await note.push(nodeJsonNote);
        }
    }
}

async function addKafka(note){
    let kafka_info = await JSON.parse(await dbutil.query(dbutil.kafka_info.querys.kafka_info));
    for (var i = 0; i < kafka_info.idx.length; i++){
        let KafkaNote = {
            "To": gc_define.To,
            "Fee": gc_define.Fee,
            "Kind": gc_define.Kind.kafka,
            "Content": {
                "IDX": kafka_info.idx[i],
                "BrokerList": kafka_info.broker_list[i],
                "TopicList": kafka_info.topic_list[i]
            },
            "Date": await common.timeStampSEC()
        }
        await note.push(KafkaNote);
    }
}

async function addRewardPolicy(note) {
    let RewardPolicyNote = {
        "To": gc_define.To,
        "Fee": gc_define.Fee,
        "Kind": config.rewardPolicyKind,
        "Content": {
            "CoinType": config.securityCoinKind,
            "Period": (parseInt(config.rewardInterval) / 1000),
            "TotalReward": config.rewardAmount,
            "RewardFeeRatio" : config.rewardFeeRatio
        },
        "Date": await common.timeStampSEC()
    }
    note.push(RewardPolicyNote);
}

async function genesisObject(note){
    object = {
        "Revision": gc_define.Revision,
        "PreviousKeyID": gc_define.PreviousKeyID,
        "ContractCreateTime": await common.timeStampMS(),
        "Fintech": gc_define.Fintech,
        "From": define.genesisContract.ed_pub_idx + await cryptoutil.PEM_pubkey_read(config.keypath.my_key + config.keypath.ed_pubkey_name),
        "Balance": gc_define.Balance,
        "NotePrivacy": gc_define.NotePrivacy,
        "Note": note
    }
    let signature = await cryptoutil.Ed25519Sign(JSON.parse(JSON.stringify(object)));
    object.Signature = signature;
    logger.debug(object);
    return object;
}

async function rewardObject(note) {
    let my_status = await statusIS();
    object = {
        "Revision": (parseInt(my_status.contents.revision) + 1),
        "PreviousKeyID": my_status.contents.previous_key,
        "ContractCreateTime": await common.timeStampMS(),
        "Fintech" : config.txFintech,
        "From": define.genesisContract.ed_pub_idx + await cryptoutil.PEM_pubkey_read(config.keypath.my_key + config.keypath.ed_pubkey_name),
        "Balance": gc_define.Balance,
        "NotePrivacy": gc_define.rewardPrivacy,
        "Note": note
    }
    let signature = await cryptoutil.Ed25519Sign(JSON.parse(JSON.stringify(object)));
    object.Signature = signature;
    return object;
}