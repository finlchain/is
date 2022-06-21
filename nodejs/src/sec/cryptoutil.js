//
const crypto = require('crypto');
const { createECDH, ECDH } = require("crypto");
const fs = require('fs');
const eddsa = require('elliptic').eddsa;
const pemreader = require('crypto-key-composer');

//
const cryptoSsl = require("./../../../../addon/crypto-ssl");

//
const config = require('./../../config/config.js');
const define = require('./../../config/define.js');
const util = require('./../utils/commonUtil.js');
const contractUtil = require('./../contract/contractUtil.js');
const logger = require('./../utils/winlog.js');

//
let keyMe = new Object();

//////////////////////////////////////////////////
//
module.exports.decKeyNoFile = (keyBin, keySeed) => {
    let dec;

    if (keyBin.includes("BEGIN") && keyBin.includes("END") && keyBin.includes("KEY"))
    {
        logger.debug("It is an decrypted file");

        dec = keyBin;
    }
    else
    {
        logger.debug("It is an encrypted file 1");

        if (keySeed === undefined)
        {
            logger.error("keySeed is not defined.");
            return dec;
        }

        //
        const encBinary = Buffer.from(keyBin, 'ascii');
        let encBinaryHexStr = encBinary.toString('hex');
        logger.debug(encBinaryHexStr);

        dec = cryptoSsl.aesDecBinary(encBinaryHexStr, keySeed, keySeed.length);
    }

    return dec;
}

//
module.exports.decKey = (keyPath, keySeed) => {
    let dec;

    if (keyPath.includes("fin"))
    {
        logger.debug("It is an encrypted file");

        dec = cryptoSsl.aesDecFile(keyPath, keySeed, keySeed.length);
    }
    else
    {
        logger.debug("It is an decrypted file");

        dec = fs.readFileSync(keyPath);
    }

    return dec;
}

module.exports.readPubkeyPem = (path, seed) => {
    let decPubKey = this.decKey(path, seed);

    let pemRead = pemreader.decomposePublicKey(decPubKey);
    return pemRead;
}

module.exports.readPrikeyPem = (path, seed) => {
    let decPriKey = this.decKey(path, seed);

    let pemRead = pemreader.decomposePrivateKey(decPriKey);
    return pemRead;
}

module.exports.getPubkey = (pubkeyPath) => {
    //
    let pubkey_path = typeof pubkeyPath !== 'undefined' ? pubkeyPath : config.MY_KEY_PATH_CONFIG.pubkey;

    //
    let pemRead = this.readPubkeyPem(pubkey_path, config.INFO_PATH.KEY_SEED);

    //
    // let publicKey = util.bytesToBuffer(pemRead.keyData.bytes).toString('hex');

    // return publicKey;

    if(pubkey_path.includes("ed")) 
    {
        let pubkey;

        pubkey = util.bytesToBuffer(pemRead.keyData.bytes);

        return (define.CONTRACT_DEFINE.ED_PUB_IDX + pubkey.toString('hex'));
    }
    else
    {
        let ec_point_x;
        let ec_point_y;

        ec_point_x = util.bytesToBuffer(pemRead.keyData.x).toString('hex');
        ec_point_y = util.bytesToBuffer(pemRead.keyData.y).toString('hex');
        
        const uncompressedpubkey = define.SEC_DEFINE.KEY_DELIMITER.SECP256_UNCOMPRESSED_DELIMITER + ec_point_x + ec_point_y;
        const pubkey = ECDH.convertKey(uncompressedpubkey,
                                                define.SEC_DEFINE.CURVE_NAMES.ECDH_SECP256R1_CURVE_NAME,
                                                "hex",
                                                "hex",
                                                define.SEC_DEFINE.CONVERT_KEY.COMPRESSED);

        return pubkey;
    }
}

module.exports.convertPubKey = (pubkey, curveName, delimiter) => {
    try {
        return ECDH.convertKey(pubkey, curveName, "hex", "hex", delimiter);
    } catch (err) {
        console.log(err);
        return false;
    }
}

/////////////////////////////////////////////////////
// My Key
module.exports.setMyKey = (myKeyPath) => {
    logger.debug("myKeyPath.prikey : " + myKeyPath.prikey);
    logger.debug("myKeyPath.pubkey : " + myKeyPath.pubkey);
    logger.debug("config.INFO_PATH.KEY_SEED : " + config.INFO_PATH.KEY_SEED);
    // for net
    keyMe.prikey = this.readPrikeyPem(myKeyPath.prikey, config.INFO_PATH.KEY_SEED);
    keyMe.pubkey = this.readPubkeyPem(myKeyPath.pubkey, config.INFO_PATH.KEY_SEED);
}

module.exports.getMyPubkey = () => {
    let pubkey = this.getPubkey();
    return pubkey;
}

//////////////////////////////////////////////////
// Get sha256 Hash
module.exports.genSha256Str = (msgBuf) => {
    const sha256Result = crypto.createHash(define.SEC_DEFINE.HASH_ALGO);
    sha256Result.update(msgBuf);
    return sha256Result.digest(define.SEC_DEFINE.DIGEST.HEX);
}

//////////////////////////////////////////////////
//
module.exports.eddsaVerifyHex = (inputData, signature, pubkeyHex) => {
    //
    let transferHash = cryptoSsl.genSha256Hex(inputData);
    logger.debug("transferHash : " + transferHash);

    //
    let ed = new eddsa(define.SEC_DEFINE.CURVE_NAMES.EDDSA_CURVE_NAME);
    let pubKey = ed.keyFromPublic(pubkeyHex, "hex");

    let verifyRet = pubKey.verify(transferHash, signature);
    logger.debug("verifyRet : " + verifyRet);

    return verifyRet;
}

module.exports.eddsaSignHex = (inputData, prikeyHex) => {
    //
    let transferHash = cryptoSsl.genSha256Hex(inputData);
    logger.debug("transferHash : " + transferHash);

    //
    let ed = new eddsa(define.SEC_DEFINE.CURVE_NAMES.EDDSA_CURVE_NAME);
    let priKey = ed.keyFromSecret(prikeyHex);

    //
    let signature = priKey.sign(transferHash).toHex();

    return signature;
}

module.exports.genSignNoFile = (contractJson, seed, prikey) => {
    const mergedBuffer = contractUtil.signBufferGenerator(contractJson);

    let inputData = cryptoSsl.genSha256Str(mergedBuffer);
    // let inputData = this.genSha256Str(mergedBuffer);
    logger.debug("inputData : " + inputData);

    //
    let decPrikey = this.decKeyNoFile(prikey, seed);
    let pemRead = pemreader.decomposePrivateKey(decPrikey);

    //
    let prikeyBuf = util.bytesToBuffer(pemRead.keyData.seed);
    let prikeyHex = prikeyBuf.toString('hex');

    //
    let signature = this.eddsaSignHex(inputData, prikeyHex);

    // let signature = 'ABCDEF';

    //
    ///////////////////////////////////////////////////////////
    // let pubkeyHex = this.getMyPubkey();

    // let verRet = cryptoSsl.eddsaVerifyHex(inputData, signature, pubkeyHex);
    // logger.debug("verRet : " + verRet);

    // let verRet2 = this.eddsaVerifyHex(inputData, signature, pubkeyHex);
    // logger.debug("verRet2 : " + verRet2);
    ///////////////////////////////////////////////////////////

    return signature;
}

module.exports.genSign = (contractJson, seed, prikeyPath) => {
    //
    const mergedBuffer = contractUtil.signBufferGenerator(contractJson);

    let inputData = cryptoSsl.genSha256Str(mergedBuffer);
    logger.debug("inputData : " + inputData);

    //
    let prikey_path = typeof prikeyPath !== 'undefined' ? prikeyPath : config.MY_KEY_PATH_CONFIG.prikey;
    let decPrikey = this.decKey(prikey_path, seed);
    let pemRead = pemreader.decomposePrivateKey(decPrikey);

    //
    let prikeyBuf = util.bytesToBuffer(pemRead.keyData.seed);
    let prikeyHex = prikeyBuf.toString('hex');

    //
    let signature = this.eddsaSignHex(inputData, prikeyHex);

    //
    ///////////////////////////////////////////////////////////
    // let pubkeyHex = this.getMyPubkey();

    // let verRet = cryptoSsl.eddsaVerifyHex(inputData, signature, pubkeyHex);
    // logger.debug("verRet : " + verRet);

    // let verRet2 = this.eddsaVerifyHex(inputData, signature, pubkeyHex);
    // logger.debug("verRet2 : " + verRet2);
    ///////////////////////////////////////////////////////////

    return signature;
}
