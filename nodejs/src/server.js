const socket = require('./net/socket.js');
const command = require('./cli/command.js');
const kafkautil = require('./net/kafkautil.js');
const config = require('../config/config.js');
const dbutil = require('./db/dbutil.js');

module.exports.tcpServer = async () => {
    socket.bindISAServer();
    socket.bindISA0Server();
}

module.exports.cmd = async () => {
    command.ListenCommand();
}

module.exports.kafka = async () => {
    await kafkautil.initKafka();
}

module.exports.dbInitForTest = async () => {
    if(config.testMode){
        await dbutil.truncate();
    }
}