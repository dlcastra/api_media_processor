import {GetObjectCommand} from "@aws-sdk/client-s3";
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

export {getFileMetaData};