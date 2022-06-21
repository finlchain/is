//
const loggerConfig = {
    format: [
        "[{{title}}] [{{timestamp}}] [in {{file}}:{{line}}] {{message}}", //default format
        {
            log: "[{{title}}]   [{{timestamp}}] [in {{file}}:{{line}}] {{message}}",
            debug: "[{{title}}] [{{timestamp}}] [in {{file}}:{{line}}] {{message}}",
            info: "[{{title}}]  [{{timestamp}}] [in {{file}}:{{line}}] {{message}}",
            trace: "[{{title}}]  [{{timestamp}}] [in {{file}}:{{line}}] {{message}}",
            warn: "[{{title}}]  [{{timestamp}}] [in {{file}}:{{line}}] {{message}}",
            error: "[{{title}}] [{{timestamp}}] [in {{file}}:{{line}}] {{message}}" // error format
        }
    ],
    dateformat: "yyyy.mm.dd HH:MM:ss.L",
    preprocess: function (data) {
        data.title = data.title.toUpperCase();
    }
};

const logger = require('tracer').colorConsole(loggerConfig);

// APP Log
const LOG_KIND = {
    INFO : 1,
    DEBUG : 2,
    TRACE :3,
    WARN : 4,
    ERROR : 5,
    NONE : 6
};

// 0 : none, 1 : info, error, 2: debug, warn, info, error
let LOG_LEVEL = LOG_KIND.DEBUG;

module.exports.info = async (data) => {
    if (LOG_LEVEL >= LOG_KIND.INFO) {
        logger.info(data);
    }
};

module.exports.debug = async (data) => {
    if (LOG_LEVEL >= LOG_KIND.DEBUG) {
        logger.debug(data);
    }
};

module.exports.trace = async (data) => {
    if (LOG_LEVEL >= LOG_KIND.TRACE) {
        logger.trace(data);
    }
};

module.exports.warn = async (data) => {
    if (LOG_LEVEL >= LOG_KIND.WARN) {
        logger.warn(data);
    }
};

module.exports.error = async (data) => {
    if (LOG_LEVEL >= LOG_KIND.ERROR) {
        logger.error(data);
    }
};