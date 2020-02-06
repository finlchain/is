const server = require('./src/server.js');
const define = require('./config/define.js');

main();

async function main(){
    console.log(define.startMsg);
    await server.dbInitForTest();
    await server.kafka();
    server.cmd();
    server.tcpServer();
}
