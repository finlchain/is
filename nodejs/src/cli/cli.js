//
const define = require('./../../config/define.js');
const cliHandler = require('./../cli/cliHandler.js');
const logger = require('./../utils/winlog.js');

// CLI
module.exports.cliCallback = async () => {
    process.stdin.resume();
    process.stdin.setEncoding(define.CMD.encoding);

    logger.info('[CLI] Command Listening');

    process.stdin.on('data', async function(cmd){
        let regexResult = define.REGEX.NEW_LINE_REGEX.test(cmd);
        if(regexResult)
        {
            cmd = cmd.substring(0, cmd.length - 1);
        }

        let cmd_result = await cliHandler.handler(cmd);
        // if(cmd_result){
        //     logger.debug(cmd + define.CMD.success);
        // }
        // else{
        //     logger.error(cmd + define.CMD.error);
        // }
    })
}