//
const kafkaNode = require('kafka-node');
const rdKafka = require('node-rdkafka');

//
const config = require('./../../config/config.js');
const define = require('./../../config/define.js');
const dbUtil = require('./../db/dbUtil.js');
const dbIS = require('./../db/dbIS.js');
const util = require('./../utils/commonUtil.js');
const logger = require('./../utils/winlog.js');

////////////////////////////////////////////////////////
// kafkaNode
const listTopicCB = (admin, topicArr) => {
    return new Promise((resolve, reject) => {
        admin.listTopics((err, res) => {
            let topic = Object.keys(res[1].metadata);
            for (var i = 0; i < topic.length; i++) {
                // if (topic[i].length === 12) {
                //     topicArr.push(topic[i]);
                // }
                topicArr.push(topic[i]);
            }
            if (err) {
                reject(err);
            } else {
                resolve(topicArr);
            }
        });
    });
}

const listTopic = async (kafka_admin) => {
    let admin = new kafkaNode.Admin(kafka_admin);
    let topicArr = new Array();

    topicArr = listTopicCB(admin, topicArr).then((resData) => {
        return resData;
    });

    // topicArr = topicArr.split(',');
    return topicArr;
}

////////////////////////////////////////////////////////
// init kafka
module.exports.initKafka = async() => {
    logger.info('[KAFKA] Kafka Init Start');

    // Get Kafka List
    let selectKafkaInfo = await dbUtil.query(dbIS.querys.is.kafka_info.selectKafkaInfo);

    if (!selectKafkaInfo.length)
    {
        logger.error("Error - No data from kafka_info");
        return;
    }

    // Delete Previous Topic List
    for(var i =0 ; i < selectKafkaInfo.length ; i++)
    {
        let broker_list = selectKafkaInfo[i].broker_list;
        logger.debug("idx : " + selectKafkaInfo[i].idx + ", broker_list : " + broker_list);

        ///////////////////////////////////////////////////////
        // Get kafka topic list
        let admin;
        let topicArr;

        admin = new kafkaNode.KafkaClient(
            {
                kafkaHost: broker_list
            }
        );

        topicArr = await listTopic(admin);
        logger.debug("kafka topic list : " + JSON.stringify(topicArr));

        ///////////////////////////////////////////////////////
        // Delete topic list
        let client;

        client = rdKafka.AdminClient.create({
            'client.id': 'IS',
            'metadata.broker.list': broker_list
        });
	
		// delete all kafka old topic list
        await util.asyncForEach(topicArr, async(element, index) =>{
            logger.debug("old Topic[" + index + "] : " + element);
            //
            await client.deleteTopic(element, 1000,
                function (err) {
                    // logger.error(err);
                }
            );

            logger.debug('[KAFKA] delete topic Success : ' + element + ' at ' + broker_list);

            await util.sleep(100);
        });

        await client.disconnect();
    }

    // await util.sleep(500);

    // Create Topic List
    for(var i =0 ; i < selectKafkaInfo.length ; i++)
    {
        //
        let broker_list = selectKafkaInfo[i].broker_list;
        let topic_list = selectKafkaInfo[i].topic_list;
        // logger.debug("kafka_info idx : " + selectKafkaInfo[i].idx + ", topic_list : " + topic_list + ", broker_list : " + broker_list);

        let repl_factor = broker_list.split(',').length;
        logger.debug("repl_factor : " + repl_factor);

        ///////////////////////////////////////////////////////
        // Create topic list
        let client;

        client = rdKafka.AdminClient.create({
            'client.id': 'IS',
            'metadata.broker.list': broker_list
        });

        /////////////////////////////////////////////////////////
        // create new topic
        // // ALGO 1
        // let newTopicArr = new Array();

        // for (let idx=1; idx<=define.KFK_DEFINE.KFK_SUBNET_TOPIC_NUM; idx++)
        // {
        //     newTopicArr.push(topic_list + idx.toString());
        // }

        // await util.asyncForEach(newTopicArr, async(element, index) =>{
        //     // create new topic
        //     await client.createTopic(
        //         {
        //             topic: element,
        //             num_partitions: 1,
        //             replication_factor: repl_factor
        //         }, function (err) {
        //             // logger.error(err);
        //         }
        //     );

        //     logger.debug("kafka_info idx " + selectKafkaInfo[i].idx + ' : topic[' + element + '] is created into broker ' + broker_list);
        //     await util.sleep(100);
        // });

        // ALGO 2
        await client.createTopic(
            {
                topic: topic_list,
                num_partitions: 1,
                replication_factor: repl_factor
            }, function (err) {
                // logger.error(err);
            }
        );

        logger.debug("kafka_info idx " + selectKafkaInfo[i].idx + ' : topic[' + topic_list + '] is created into broker ' + broker_list);
        await util.sleep(100);

        //
        await client.disconnect();
        logger.info('[KAFKA] Kafka Init Success');
    }
}

////////////////////////////////////////////////////////
// Get Kafka Topic List
module.exports.getKafkaTopicList = async() => {
    logger.info('[KAFKA] getKafkaTopicList');

    // Get Kafka List
    let selectKafkaInfo = await dbUtil.query(dbIS.querys.is.kafka_info.selectKafkaInfo);

    if (!selectKafkaInfo.length)
    {
        logger.error("Error - No data from kafka_info");
        return;
    }

    // Delete Previous Topic List
    for(var i =0 ; i < selectKafkaInfo.length ; i++)
    {
        let broker_list = selectKafkaInfo[i].broker_list;
        logger.debug("idx : " + selectKafkaInfo[i].idx + ", broker_list : " + broker_list);

        ///////////////////////////////////////////////////////
        // Get kafka topic list
        let admin;
        let topicArr;

        admin = new kafkaNode.KafkaClient(
            {
                kafkaHost: broker_list
            }
        );

        topicArr = await listTopic(admin);
        logger.debug("kafka topic list : " + JSON.stringify(topicArr));
    }
}

// Delete Kafka Topic List
module.exports.delKafkaTopicList = async() => {
    logger.info('[KAFKA] delKafkaTopicList');

    // Get Kafka List
    let selectKafkaInfo = await dbUtil.query(dbIS.querys.is.kafka_info.selectKafkaInfo);

    if (!selectKafkaInfo.length)
    {
        logger.error("Error - No data from kafka_info");
        return;
    }

    // Delete Previous Topic List
    for(var i =0 ; i < selectKafkaInfo.length ; i++)
    {
        let broker_list = selectKafkaInfo[i].broker_list;
        logger.debug("idx : " + selectKafkaInfo[i].idx + ", broker_list : " + broker_list);

        ///////////////////////////////////////////////////////
        // Get kafka topic list
        let admin;
        let topicArr;

        admin = new kafkaNode.KafkaClient(
            {
                kafkaHost: broker_list
            }
        );

        topicArr = await listTopic(admin);
        logger.debug("kafka topic list : " + JSON.stringify(topicArr));

        ///////////////////////////////////////////////////////
        // Delete topic list
        let client;

        client = rdKafka.AdminClient.create({
            'client.id': 'IS',
            'metadata.broker.list': broker_list
        });
	
		// delete all kafka old topic list
        await util.asyncForEach(topicArr, async(element, index) =>{
            logger.debug("old Topic[" + index + "] : " + element);
            //
            await client.deleteTopic(element, 1000,
                function (err) {
                    // logger.error(err);
                }
            );

            logger.debug('[KAFKA] delete topic Success : ' + element + ' at ' + broker_list);

            await util.sleep(100);
        });

        await client.disconnect();
    }
}
