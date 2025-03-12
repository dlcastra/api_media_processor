import dotenv from "dotenv";
import express from "express";

dotenv.config();


class AppSettings {
    static PORT = 3000;

    static get AWS_ACCESS_KEY_ID() {
        return process.env.AWS_ACCESS_KEY_ID;
    }

    static get AWS_SECRET_ACCESS_KEY() {
        return process.env.AWS_SECRET_ACCESS_KEY;
    }

    static get AWS_S3_BUCKET_NAME() {
        return process.env.AWS_S3_BUCKET_NAME;
    }

    static get AWS_REGION() {
        return process.env.AWS_REGION || "eu-north-1";
    }
}


export const server = express();
export {AppSettings};