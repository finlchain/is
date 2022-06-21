//
var winston = require('winston');
require('winston-daily-rotate-file');
require('date-utils');

//
let LOG_LEVEL_FILE = "debug";
let LOG_LEVEL_CONSOLE = "debug";

//let LOGFILE_PATH = './log/is.log';
let LOGFILE_PATH = '/disk/data/log/is.log';

// let alignColorsAndTime = winston.format.combine(
//     winston.format.colorize({
//         all:true
//     }),
//     winston.format.label({
//         label:'[LOGGER]'
//     }),
//     winston.format.timestamp({
//         format:"YY-MM-DD HH:MM:SS"
//     }),
//     winston.format.printf(
//         info => ` ${info.timestamp} ${info.level} : ${info.message}`
//     )
// );

//
const getLogColor = (logLevel) => {
    let logColor = "\x1b[0m";

    switch(logLevel)
    {
    case 'error':
        logColor = "\x1b[31m"; // Red
        break;
    case 'warn':
        logColor = "\x1b[32m"; // Green
        break;
    case 'info':
        logColor = "\x1b[35m"; // Magenta
        break;
    case 'debug':
        logColor = "\x1b[34m"; // Blue
        break;
    case 'reset':
        logColor = "\x1b[0m"; // 
        break;
    default :
        logColor = "\x1b[36m"; // Cyan
        break;
    }

    return logColor;
}

//
var winlog = winston.createLogger({
    transports: [
        new winston.transports.DailyRotateFile({
            filename: LOGFILE_PATH, // store log on file name : system.log
            zippedArchive: false, // isCompress?
            level : LOG_LEVEL_FILE,
            format: winston.format.printf(
                info => `[${Date.now()}] [${info.level.toUpperCase().slice(0,1)}] ${info.message}`)
        }),
        new winston.transports.Console({
            level : LOG_LEVEL_CONSOLE,
            format : winston.format.printf(
                info => `[${Date.now()}] [${getLogColor(info.level)}${info.level.toUpperCase().slice(0,1)}${getLogColor('reset')}] ${info.message}`)
            // format : alignColorsAndTime
        })
    ]
});

module.exports = winlog;
