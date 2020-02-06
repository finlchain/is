const config = require("./../../config/config.js");
const define = require("./../../config/define.js");
const dbutil = require("./../db/dbutil.js");
const contract = require("./../contract/contract.js");
const ctx = require("../net/ctx.js");
const netutil = require("./../net/netutil.js");

let scheduleObj;
let prv_reward_contract_revision = 0;

module.exports.setRewardScheduler = () => {
    scheduleObj = setInterval(rewardFunction, config.rewardInterval);
}

module.exports.delRewardScheduler = () => {
    clearInterval(scheduleObj);
}

module.exports.sleep = async (ms) => {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    });
}

const rewardFunction = async () => {
    let reward_contract = await contract.rewardContract();
    
    if(prv_reward_contract_revision == reward_contract.Revision) {
        return;
    }
    prv_reward_contract_revision = reward_contract.Revision;

    reward_contract = define.genesisContract.deli + JSON.stringify(reward_contract);

    let db_ip_info = await JSON.parse(await dbutil.queryPre(dbutil.node_info.querys.sca0_ip_info, [config.netConfSet.maxCluster]));
    let map = ctx.getCTXMap();

    await netutil.socketWrite(map.get(netutil.inet_ntoa(db_ip_info.ip[0])), reward_contract);
}