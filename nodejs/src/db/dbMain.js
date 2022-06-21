//
const config = require('./../../config/config.js');
const define = require('./../../config/define.js');
const util = require('./../utils/commonUtil.js');
const dbUtil = require("./../db/dbUtil.js");
const dbIS = require("./../db/dbIS.js");
const dbShard = require("./../db/dbShard.js");
const dbRepl = require("./../db/dbRepl.js");
const logger = require('./../utils/winlog.js');

//
module.exports.initDatabase = async () => {
    await dbIS.initDatabaseIS();
    // await dbShard.initShard();
    await dbRepl.initReplication();
}
