'use strict';

const AWS = require('aws-sdk');
const S3 = new AWS.S3({
  signatureVersion: 'v4',
});
const Sharp = require('sharp');

const BUCKET = process.env.BUCKET;
const URL = process.env.URL;

exports.handler = function(event, context, callback) {
  const key = event.queryStringParameters.key;
  console.log(key)
  const match = key.match(/x(\d+)y(\d+)ps(\d+)X(\d+)\/(.*)/);
  console.log(match)
  const x = parseInt(match[1], 10)
  const y = parseInt(match[2], 10)
  const width = parseInt(match[3], 10);
  const height = parseInt(match[4], 10);
  const originalKey = match[5];

  S3.getObject({Bucket: BUCKET, Key: originalKey}).promise()
    .then(data => Sharp(data.Body)
      .extract({left:x,top:y,width:width,height:height})
      .toFormat('png')
      .toBuffer()
    )
    .then((buffer) => callback(null, {
        statusCode: '200',
        headers: {'Content-Type': 'image/png'},
        body: buffer.toString('base64'),
        isBase64Encoded: true
      })
    )
    .catch(err => callback(err))
}
