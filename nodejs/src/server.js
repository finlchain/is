//
const config = require('../config/config.js');
const dbUtil = require('./db/dbUtil.js');
const socket = require('./net/socket.js');
const kafkaUtil = require('./net/kafkaUtil.js');

// TCP SOCKET
module.exports.tcpServer = async () => {
    await socket.bindISAServer();
    await socket.bindISAgServer();
}

// KAFKA ADMIN
module.exports.kafka = async () => {
    await kafkaUtil.initKafka();
}
