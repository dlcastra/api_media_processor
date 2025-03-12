import express from "express";
import multer from "multer";

import getImageService from "./services.js";
import getImageValidator from "./validators.js";
import {getFileMetaData} from "../aws/handlers.js";
import {AppSettings} from "../core/settings.js";

const upload = multer({storage: multer.memoryStorage()});
const router = express.Router();

router.post("/flip", upload.single("file"), async (req, res) => {
    try {
        const bucketName = AppSettings.AWS_S3_BUCKET_NAME;

        if (req.body.s3Key) {
            const file = await getFileMetaData(bucketName, req.body.s3Key);
            req.body = {...req.body, file};
        }

        const validator = await getImageValidator(req);
        const errors = await validator.validate();
        if (errors) return res.status(400).json(errors);

        const fileBuffer = req.body?.s3Key ? req.body.file?.buffer : req.file?.buffer;
        const fileFormat = req.body?.s3Key ? req.body.file?.contentType : req.file?.mimetype;

        const imageService = await getImageService(fileBuffer, fileFormat, req.body.flipType);
        const invertedBuffer = await imageService.invert();

        res.set("Content-Type", fileFormat);
        res.send(invertedBuffer);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "An error occurred processing the image"});
    }
});


export default router;
