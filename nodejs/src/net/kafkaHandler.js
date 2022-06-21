//
const rdKafka = require('node-rdkafka');

//
const config = require('./../../config/config.js');
const define = require('./../../config/define.js');
const util = require('./../utils/commonUtil.js');
const logger = require('./../utils/winlog.js');

////////////////////////////////////////////////////////////
//
//counter to stop this sample after maxMessages are sent
var counter = 0;
var maxMessages = 1;

//
module.exports.sendRdKafkaMsgStd = async (brokers, topicName, msg) => {
    logger.debug("brokers : " + brokers);

    var producer = new rdKafka.Producer({
        //'debug' : 'all',
        // 'metadata.broker.list': 'localhost:9092',
        'metadata.broker.list': brokers,
        'dr_cb': true  //delivery report callback
    });

    producer.on('delivery-report', function(err, report) {
        logger.debug('delivery-report: ' + JSON.stringify(report));
        counter++;
    });

    // Connect to the broker manually
    producer.connect();

    // Wait for the ready event before proceeding
    producer.on('ready', function(arg) {
        try {
            logger.debug('producer ready.' + JSON.stringify(arg));

            let partition = -1; //null; // this defaults to -1 - which will use librdkafka's default partitioner (consistent random for keyed messages, random for unkeyed messages)
            let value = Buffer.from(msg); // Message to send. Must be a buffer
            let key = 'Stormwind';
            let timestamp = Date.now(); // it will get added. Otherwise, we default to 0
            // var headers = [
            //     { header: "header value" }
            // ]

            producer.produce(topicName, partition, value, key, timestamp);
            // producer.produce(topicName, partition, value, key, timestamp, "", headers);

            //need to keep polling for a while to ensure the delivery reports are received
            var pollLoop = setInterval(function() {
                producer.poll();
                logger.debug('producer.poll');

                if (counter === maxMessages)
                {
                    //
                    clearInterval(pollLoop);
                    //
                    producer.disconnect();
                    //
                    counter = 0;
                }
            }, 100);
        } catch (err) {
            logger.error('A problem occurred when sending our message');
            logger.error(err);
        }
    });

    // Any errors we encounter, including connection errors
    producer.on('event.error', function(err) {
        logger.error('Error from producer');
        logger.error(err);
    })

    producer.on('disconnected', function(arg) {
        logger.debug('producer disconnected. ' + JSON.stringify(arg));
    });

    // // We must either call .poll() manually after sending messages
    // // or set the producer to poll on an interval (.setPollInterval).
    // // Without this, we do not get delivery events and the queue
    // // will eventually fill up.
    // producer.setPollInterval(100);
}

module.exports.sendRdKafkaMsgStream = async (brokers, topicName, msg) => {
    logger.debug("brokers : " + brokers);

    // Our producer with its Kafka brokers
    // This call returns a new writable stream to our topic 'topic-name'
    var stream = rdKafka.Producer.createWriteStream({
        'metadata.broker.list': brokers
    }, {}, {
        topic: topicName
    });

    // Writes a message to the stream
    var queuedSuccess = stream.write(Buffer.from(msg));

    if (queuedSuccess)
    {
        logger.debug(msg);
    }
    else
    {
        // Note that this only tells us if the stream's queue is full,
        // it does NOT tell us if the message got to Kafka!  See below...
        logger.debug('Too many messages in our queue already');
    }

    // NOTE: MAKE SURE TO LISTEN TO THIS IF YOU WANT THE STREAM TO BE DURABLE
    // Otherwise, any error will bubble up as an uncaught exception.
    stream.on('error', function (err) {
        // Here's where we'll know if something went wrong sending to Kafka
        logger.error('Error in our kafka stream');
        logger.error(err);
    })
}
