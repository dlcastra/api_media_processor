import {S3Client} from "@aws-sdk/client-s3";
import {AppSettings} from "../core/settings.js";


const s3 = new S3Client({
    region: AppSettings.AWS_REGION,
    credentials: {
        accessKeyId: AppSettings.AWS_ACCESS_KEY_ID,
        secretAccessKey: AppSettings.AWS_SECRET_ACCESS_KEY,
        bucketName: AppSettings.AWS_S3_BUCKET_NAME
    }
});

export {s3};