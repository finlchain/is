//
const http = require('http');
const request = require('request');

//
const util = require("./../utils/commonUtil.js");

const APICall_POST_CB = async(httpConfig, postData) => {
    return new Promise((resolve, reject) => {
        let req = http.request(httpConfig, (res) => {
            if(res.statusCode < 200
                || res.status >= 500) 
            {
                return reject(new Error('statusCode=' + res.statusCode));
            }

            let resData = [];
            let concat_resData;
            res.on('data', (data) => {
                resData.push(data);
            });

            res.on('end', () => {
                try {
                    concat_resData = Buffer.concat(resData).toString();

                    if(util.isJsonString(concat_resData))
                    {
                        concat_resData = JSON.parse(concat_resData);
                    }
                } catch (e) {
                    reject(e);
                }
                resolve(concat_resData);
            })
        });

        req.on('error', (err) => {
            reject(err);
        });
        if (postData) {
            req.write(JSON.stringify(postData));
        }
        req.end();
    })
}

const APICAll_GET_CB = async(url, propertiesObj) => {
    return new Promise((resolve, reject) => {
        request({url : url, qs : propertiesObj}, (err, response, body) => {
            if(err) reject(err)

            if(response === undefined) {
                reject(response);
            }

            if(response.statusCode < 200 
                || response.statusCode >= 500)
            {
                return reject(new Error('statusCode=' + response.statusCode));
            }
            else {
                resolve(body);
            }
        });
    })
}

module.exports.APICall_POST = async (httpConfig, data) => { 
    let ret = await APICall_POST_CB(httpConfig, data).then((resData) => {
        return resData;
    });
    return ret;
}

module.exports.APICall_GET = async(url, propertiesObj) => {
    let ret = await APICAll_GET_CB(url, propertiesObj).then((resData) => {
        return JSON.parse(resData);
    });
    return ret;
}