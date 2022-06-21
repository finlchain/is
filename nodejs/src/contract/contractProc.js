//
const fs = require('fs');
const os = require('os');

//
const config = require('../../config/config.js');
const define = require('../../config/define.js');
const cryptoUtil = require('../sec/cryptoUtil.js');
const util = require('../utils/commonUtil.js');
const dbUtil = require('../db/dbUtil.js');
const logger = require('../utils/winlog.js');

const GC_DEFINE = define.CONTRACT_DEFINE;

module.exports.TOKEN_NAME = 'FNODE';
module.exports.TOKEN_SYMBOL = 'finl';
module.exports.TOKEN_TOTAL_SUPPLY = '100000000000.000000000';
module.exports.TOKEN_DECIMAL_POINT = GC_DEFINE.NANO_DECIMAL_POINT;

if (os.hostname().includes('finlt'))
{
    this.TOKEN_NAME = 'FINLT';
    this.TOKEN_SYMBOL = 'fint';
    this.TOKEN_TOTAL_SUPPLY = '100000000000.000000000';
    this.TOKEN_DECIMAL_POINT = GC_DEFINE.NANO_DECIMAL_POINT;
}
if (os.hostname().includes('finld'))
{
    this.TOKEN_NAME = 'FINLD';
    this.TOKEN_SYMBOL = 'finD';
    this.TOKEN_TOTAL_SUPPLY = '100000000000.000000000';
    this.TOKEN_DECIMAL_POINT = GC_DEFINE.NANO_DECIMAL_POINT;
}
else if (os.hostname().includes('puri'))
{
    this.TOKEN_NAME = 'PURI';
    this.TOKEN_SYMBOL = 'pure';
    this.TOKEN_TOTAL_SUPPLY = '100000000000.000000000';
    this.TOKEN_DECIMAL_POINT = GC_DEFINE.NANO_DECIMAL_POINT;
}

// New
module.exports.gcAddUserIS = function(){
    //
    let myNetPubkey = cryptoUtil.getMyPubkey();
    logger.info(myNetPubkey);

    let contractJson = {
        create_tm : util.getDateMS().toString(),
        fintech : GC_DEFINE.FINTECH.NON_FINANCIAL_TX,
        privacy : GC_DEFINE.PRIVACY.PUBLIC,
        fee : GC_DEFINE.FEE_DEFAULT,
        from_account : GC_DEFINE.FROM_DEFAULT,
        to_account : GC_DEFINE.TO_DEFAULT,
        action : GC_DEFINE.ACTIONS.CONTRACT.DEFAULT.ADD_USER,
        contents : {
            owner_pk : myNetPubkey,
            super_pk : myNetPubkey,
            account_id : 'IS00'
        },
        memo : ""
    };

    //
    let sig = cryptoUtil.genSign(JSON.parse(JSON.stringify(contractJson)), config.INFO_PATH.KEY_SEED);
    contractJson.sig = sig;

    contractJson.signed_pubkey = myNetPubkey;

    return contractJson;
}

module.exports.gcCreateSecToken = function(){
    //
    let myNetPubkey = cryptoUtil.getMyPubkey();
    logger.info(myNetPubkey);

    let contractJson = {
        create_tm : util.getDateMS().toString(),
        fintech : GC_DEFINE.FINTECH.NON_FINANCIAL_TX,
        privacy : GC_DEFINE.PRIVACY.PUBLIC,
        fee : GC_DEFINE.FEE_DEFAULT,
        from_account : GC_DEFINE.FROM_DEFAULT,
        to_account : GC_DEFINE.TO_DEFAULT,
        action : GC_DEFINE.ACTIONS.CONTRACT.DEFAULT.TOKEN_CREATION,
        contents : {
            owner_pk : myNetPubkey, //'05' + util.getRandomNumBuf(32).toString('hex'),
            super_pk : myNetPubkey, //'05' + util.getRandomNumBuf(32).toString('hex'),
            action : GC_DEFINE.ACTIONS.TOKEN.SECURITY_TOKEN,
            name : this.TOKEN_NAME,
            symbol : this.TOKEN_SYMBOL,
            total_supply : this.TOKEN_TOTAL_SUPPLY,
            decimal_point : this.TOKEN_DECIMAL_POINT,
            lock_time_from : "0",
            lock_time_to : "0",
            lock_transfer : 0,
            black_list : "",
            functions : ""
        },
        memo : ""
    };

    //
    let sig = cryptoUtil.genSign(JSON.parse(JSON.stringify(contractJson)), config.INFO_PATH.KEY_SEED);
    contractJson.sig = sig;

    contractJson.signed_pubkey = myNetPubkey;

    return contractJson;
}

module.exports.gcCreateSecTokenWithKey = function(ownerPubkey, superPubkey, ownerPrikey, seed){
    //
    let contractJson = {
        create_tm : util.getDateMS().toString(),
        fintech : GC_DEFINE.FINTECH.NON_FINANCIAL_TX,
        privacy : GC_DEFINE.PRIVACY.PUBLIC,
        fee : GC_DEFINE.FEE_DEFAULT,
        from_account : GC_DEFINE.FROM_DEFAULT,
        to_account : GC_DEFINE.TO_DEFAULT,
        action : GC_DEFINE.ACTIONS.CONTRACT.DEFAULT.TOKEN_CREATION,
        contents : {
            owner_pk : ownerPubkey, //'05' + util.getRandomNumBuf(32).toString('hex'),
            super_pk : superPubkey, //'05' + util.getRandomNumBuf(32).toString('hex'),
            action : GC_DEFINE.ACTIONS.TOKEN.SECURITY_TOKEN,
            name : this.TOKEN_NAME,
            symbol : this.TOKEN_SYMBOL,
            total_supply : this.TOKEN_TOTAL_SUPPLY,
            decimal_point : this.TOKEN_DECIMAL_POINT,
            lock_time_from : "0",
            lock_time_to : "0",
            lock_transfer : 0,
            black_list : "",
            functions : ""
        },
        memo : ""
    };

    //
    let sig = cryptoUtil.genSignNoFile(JSON.parse(JSON.stringify(contractJson)), seed, ownerPrikey);
    contractJson.sig = sig;

    contractJson.signed_pubkey = ownerPubkey;

    return contractJson;
}
