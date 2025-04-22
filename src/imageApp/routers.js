import express from "express";
import multer from "multer";

import {AppSettings} from "../core/settings.js";
import {CommonResponseErrorMessages} from "../responses.js";
import {callback} from "../utils.js";
import {getImageFlipValidator, getImageTextExtractorValidator} from "./validators.js";
import {getFileMetaData} from "../aws/handlers.js";
import {imageFlipHandler, imageTextExtractionHandler} from "./handlers.js";

const upload = multer({storage: multer.memoryStorage()});
const router = express.Router();


router.post("/flip", upload.single("file"), async (req, res) => {
    const bucketName = AppSettings.AWS_S3_BUCKET_NAME;

    try {
        if (req.body.s3Key) {
            const file = await getFileMetaData(bucketName, req.body.s3Key);
            req.body = {...req.body, file};
        }

        const validator = await getImageFlipValidator(req);
        const errors = await validator.validate();
        if (errors) {
            return res.status(400).json(errors);
        }

        const processing_result = await imageFlipHandler(req, bucketName);
        if (!processing_result.success) {
            await callback(req.body.callbackUrl, "error", {error: processing_result.error});
            return res.status(500).json({error: CommonResponseErrorMessages.INTERNAL_IMAGE_PROCESSING_ERROR});
        }

        const callbackResponse = await callback(req.body.callbackUrl, "success", processing_result.data);
        return res.status(201).send(callbackResponse);

    } catch (error) {
        console.error(error);
        res.status(500).json({error: CommonResponseErrorMessages.INTERNAL_IMAGE_PROCESSING_ERROR});
    }
});


router.post("/extract-text", upload.single("file"), async (req, res) => {
    const bucketName = AppSettings.AWS_S3_BUCKET_NAME;

    try {
        if (req.body.s3Key) {
            const file = await getFileMetaData(bucketName, req.body.s3Key);
            req.body = {...req.body, file};
        }

        const validator = await getImageTextExtractorValidator(req);
        const errors = await validator.validate();
        if (errors) {
            return res.status(400).json(errors);
        }

        const processing_result = await imageTextExtractionHandler(req);
        if (!processing_result.success) {
            await callback(req.body.callbackUrl, "error", {error: processing_result.error});
            return res.status(500).json({error: CommonResponseErrorMessages.INTERNAL_IMAGE_PROCESSING_ERROR});
        }

        const callbackResponse = await callback(
            req.body.callbackUrl, processing_result.data.status, {extractedText: processing_result.data.result}
        );

        return res.status(201).send(callbackResponse);

    } catch (error) {
        console.error(error);
        return res.status(500).json({error: CommonResponseErrorMessages.INTERNAL_IMAGE_PROCESSING_ERROR});
    }
});


export default router;
