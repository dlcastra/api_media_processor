import express from "express";
import multer from "multer";

import {AppSettings} from "../core/settings.js";
import {CommonResponseErrorMessages} from "../responses.js";
import {extractTextFromImage} from "../azure/handlers.js";
import {getImageFlipperService} from "./services.js";
import {getImageValidator} from "./validators.js";
import {getFileMetaData} from "../aws/handlers.js";
import {TranslatorService} from "../translators/services.js";

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

        const imageService = await getImageFlipperService(fileBuffer, fileFormat, req.body.flipType);
        const invertedBuffer = await imageService.invert();

        res.set("Content-Type", fileFormat);
        res.send(invertedBuffer);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: CommonResponseErrorMessages.INTERNAL_IMAGE_PROCESSING_ERROR});
    }
});


router.post("/extract-text", upload.single("file"), async (req, res) => {
    try {
        const bucketName = AppSettings.AWS_S3_BUCKET_NAME;
        const file = req.body?.s3Key ? await getFileMetaData(bucketName, req.body.s3Key) : req.file;
        let extractedText = await extractTextFromImage(file.buffer);

        if (req.body.translator) {
            const {lang_to, lang_from, translator} = req.body
            const service = new TranslatorService(extractedText.result, lang_to, lang_from, translator);
            extractedText.result = await service.translate();
        }

        res.json(extractedText);

    } catch (error) {
        console.error(error);
        res.status(500).json({error: CommonResponseErrorMessages.INTERNAL_IMAGE_PROCESSING_ERROR});
    }
});


export default router;
