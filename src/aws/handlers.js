import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import {GetObjectCommand, PutObjectCommand} from "@aws-sdk/client-s3";
import {streamToBuffer} from "../utils.js";
import {s3} from "./clients.js";


async function getFileMetaData(bucketName, key) {
    try {
        const command = new GetObjectCommand({Bucket: bucketName, Key: key});
        const {Body, ContentType, ContentLength, Metadata} = await s3.send(command);
        const buffer = await streamToBuffer(Body);

        return {buffer, contentType: ContentType, size: ContentLength, metadata: Metadata};
    } catch (error) {
        console.error("Error while retrieving a file from S3:", error);
        return error;
    }
}

async function uploadFileBytes(bucketName, prefix, fileName, fileBytes, contentType) {
    const key = `${prefix}/${fileName}`;

    try {
        const params = {
            Bucket: bucketName,
            Key: key,
            Body: fileBytes,
            ContentType: contentType,
        };

        const command = new PutObjectCommand(params);
        await s3.send(command);

        const fileObject = new GetObjectCommand({Bucket: bucketName, Key: key})
        const fileUrl = await getSignedUrl(s3, fileObject, {expiresIn: 3600});

        return {success: true, key, url: fileUrl};

    } catch (error) {
        console.error("Error while uploading a file to S3:", error);
        return {success: false, error: error.message || "Unknown error"};
    }
}

export {getFileMetaData, uploadFileBytes};