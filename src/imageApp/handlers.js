import {getImageFlipperService} from "./services.js";
import {uploadFileBytes} from "../aws/handlers.js";
import {extractTextFromImage} from "../azure/handlers.js";
import {TranslatorService} from "../translators/services.js";

async function imageFlipHandler(req, bucketName) {
    try {
        const fileBuffer = req.body?.s3Key ? req.body.file?.buffer : req.file?.buffer;
        const fileFormat = req.body?.s3Key ? req.body.file?.contentType : req.file?.mimetype;
        const flipType = req.body.flipType;

        const imageService = await getImageFlipperService(fileBuffer, fileFormat, flipType);
        const invertedBuffer = await imageService.invert();

        const uploadingResult = await uploadFileBytes(bucketName, "processed", req.body.s3Key, invertedBuffer, fileFormat);
        if (!uploadingResult.success) {
            console.error("Error while uploading the file:", uploadingResult.error);
        }

        return {success: true, data: uploadingResult};
    } catch (error) {
        console.error("Error while flipping the image:", error);
        return {success: false, error: error.message || "Unknown error"};

    }
}


async function imageTextExtractionHandler(req) {
    try {
        const fileBuffer = req.body?.s3Key ? req.body.file?.buffer : req.file?.buffer;
        let extractedText = await extractTextFromImage(fileBuffer);

        if (req.body.translator) {
            const {lang_to, lang_from, translator} = req.body
            const service = new TranslatorService(extractedText.result, lang_to, lang_from, translator);
            extractedText.result = await service.translate();
        }

        return {success: true, data: extractedText};
    } catch (error) {
        console.error("Error while extracting text from the image:", error);
        return {success: false, error: error.message || "Unknown error"};
    }
}


export {imageFlipHandler, imageTextExtractionHandler};