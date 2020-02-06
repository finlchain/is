const define = require('../../config/define.js');
const cmdhandler = require('./cmdhandler.js');
const logger = require('../utils/logger.js');

const BLANK_REGEX = /\n+/;

module.exports.ListenCommand = async function(){
    process.stdin.resume();
    process.stdin.setEncoding(define.command.encoding);
    logger.info('[CLI] Command Listening');
    process.stdin.on('data', async function(command){
        let regexResult = BLANK_REGEX.test(command);
        if(regexResult){
            command = command.substring(0, command.length-1);
        }
        let cmd_result = await cmdhandler.handler(command);
        if(cmd_result){
            logger.info(command+define.command.success);
        }
        else{
            logger.err(command+define.command.error);
        }
    })
}