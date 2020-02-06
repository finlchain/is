const config = require('../../config/config.js');
const define = require('../../config/define.js');
const wallet = require('../contract/wallet.js');
const crypto = require('crypto');
const fs = require('fs');
const Eddsa = require('elliptic').eddsa;
const pemread = require('crypto-key-composer');

module.exports.Ed25519Sign = async(data) =>{
    let ed = new Eddsa(define.cryptoArg.eddsa);
    // let pemRead = await pemread.decomposePrivateKey(await config.aes_decrypt_prvkey);
    let pemRead = await pemread.decomposePrivateKey(fs.readFileSync('/home/mikks/IS/key/me/ed_privkey.pem'));

    let privateKey = await toBuffer(pemRead.keyData.seed);
    let signKey = await ed.keyFromSecret(privateKey.toString(define.cryptoArg.hex));

    const leftBuffer = wallet.leftSignBufferGenerator(data);
    const rightBuffer = wallet.rightSignBufferGenerator(data.Note);
    const mergedBuffer = Buffer.concat([leftBuffer, rightBuffer]);
    let transferHash = await GenerateHash(mergedBuffer);

    let signature = await signKey.sign(transferHash).toHex();

    return signature;
}

module.exports.PEM_pubkey_read = async(path) => {
    let pemRead = pemread.decomposePublicKey(fs.readFileSync(path));
    let publicKey = await toBuffer(pemRead.keyData.bytes).toString(define.cryptoArg.hex);
    return publicKey;
}

function GenerateHash(MessageBuffer) {
    const sha256Result = crypto.createHash(define.cryptoArg.hashKind);
    sha256Result.update(MessageBuffer);
    return sha256Result.digest(define.cryptoArg.hex);
}

function toBuffer(ab) {
    var buf = Buffer.alloc(ab.byteLength);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buf.length; ++i) {
        buf[i] = view[i];
    }
    return buf;
}