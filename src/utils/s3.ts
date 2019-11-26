const AWS = require('aws-sdk');
import S3B from '../config/s3';
var uniqid = require('uniqid');
var path = require('path');

export default async function s3(request, uploadPath, key = 'file', privacy = false) {
    // Configure client for use with Spaces
    const spacesEndpoint = new AWS.Endpoint(S3B.end_point);
    const s3 = new AWS.S3({
        endpoint: spacesEndpoint,
        accessKeyId: S3B.access_key_id,
        secretAccessKey: S3B.seecret_access_key
    });

    function base64MimeType(encoded) {
        let result;

        if (typeof encoded !== 'string') {
            return result;
        }

        var mime = encoded.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);

        if (mime && mime.length) {
            result = mime[1];
        }
        return result;
    }

    //const base64Data = Buffer.from(request.file.replace(/^data:image\/\w+;base64,/, ""), 'base64')
    const type = base64MimeType(request.file);
    let str = request.file.split("base64");
    const base64Data = Buffer.from(str[1], 'base64');

    //get file extension
    const extension = type.replace(/.+\//, '');

    //remember fileKey
    const fileKey = uploadPath + "/" + uniqid() + path.extname("file") + `.${extension}`;

    // Add a file to a Space
    const params = privacy ?
        {
            Body: base64Data,
            Bucket: S3B.bucket_name,
            Key: fileKey,
            ContentType: type,
            ACL: 'public-read',
            ContentEncoding: 'base64',
        } :
        {
            Body: base64Data,
            Bucket: S3B.bucket_name,
            Key: fileKey,
            ContentType: type,
            ContentEncoding: 'base64',
        };

    let uploadS3 = await new Promise(function (resolve, reject) {
        s3.upload(params, function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        })
    });

    return {
        Location: false,
        ...uploadS3,
        type
    };
};