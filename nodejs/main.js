//
const define = require('./config/define.js');
const config = require('./config/config.js');
const server = require('./src/server.js');
const dbUtil = require("./src/db/dbUtil.js");
const dbMain = require("./src/db/dbMain.js");
const cryptoUtil = require('./src/sec/cryptoUtil.js');
const cli = require('./src/cli/cli.js');
const logger = require('./src/utils/winlog.js');

//
const main = async() => {
    //
    console.log(define.START_MSG);

    //
    cryptoUtil.setMyKey(config.MY_KEY_PATH_CONFIG);
    //
    logger.debug("db.dbConfig" + JSON.stringify(dbUtil.dbConfig));

    //
    await dbMain.initDatabase();

    //
    // await server.kafka();
    await server.tcpServer();

    //
    await cli.cliCallback();
    
}

main();
