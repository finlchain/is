const config = require('../../config/config.js');
var logger = require('tracer').colorConsole(config.loggerConfig);

module.exports.info = async (data) => {
    if (config.loggerUse > 0) {
        logger.info(data);
    }
};
module.exports.debug = async (data) => {
    if (config.loggerUse > 1) {
        logger.debug(data);
    }
};
module.exports.warn = async (data) => {
    if (config.loggerUse > 1) {
        logger.warn(data);
    }
};
module.exports.err = async (data) => {
    if (config.loggerUse > 0) {
        logger.error(data);
    }
};