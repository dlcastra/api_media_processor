import {AppSettings} from "../core/settings.js";
import {AzureResponses} from "./responses.js"
import {CommonResponseErrorMessages} from "../responses.js";
import {busQueueClient, ocrClient} from "./clients.js";
import {callback} from "../utils.js";
import {getFileMetaData} from "../aws/handlers.js";
import {imageFlipHandler, imageTextExtractionHandler} from "../imageApp/handlers.js";


class AzureProcessQueueMessages {
    constructor() {
        this.bucketName = AppSettings.AWS_S3_BUCKET_NAME;
    }
    processMessage = async (message) => {
        try {
            let body = message.body;
            const callbackUrl = body.callbackUrl;

            if (body.s3Key) {
                const file = await getFileMetaData(this.bucketName, body.s3Key);
                body = {...body, file};
            }

            if (body?.action === "flip_image") {
                const imageFlipResult = await imageFlipHandler({ body }, this.bucketName);
                if (!imageFlipResult.success) {
                    await callback(callbackUrl, "error", {error: imageFlipResult.error});
                }

                await callback(callbackUrl, "success", imageFlipResult.data);

            } else if (body?.action === "extract_text") {
                const textExtractionResult = await imageTextExtractionHandler({ body });
                if (!textExtractionResult.success) {
                    await callback(callbackUrl, "error", {error: textExtractionResult.error});
                }

                await callback(
                    callbackUrl, textExtractionResult.data.status, {extractedText: textExtractionResult.data.result}
                );

            } else {
                console.warn("Unknown action:", body?.action);
                await callback(callbackUrl, "error", {error: "Unknown action"});
            }

        } catch (error) {
            console.error("Error processing message:", error);
        }
    }

    processError = async (args) => {
        console.error(`Error from source ${args.errorSource} occurred: `, args.error);
    }
}

async function extractTextFromImage(buffer) {
    try {
        const client = await ocrClient();
        const readResult = await client.readInStream(buffer);
        const operationId = readResult.operationLocation.split("/").pop();

        let waitingLimit = 0;
        let result = await client.getReadResult(operationId);
        while (result.status !== "succeeded" && result.status !== "failed" && waitingLimit < 30) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            result = await client.getReadResult(operationId);
        }

        if (result.status === "succeeded") {
            const text = result.analyzeResult.readResults
                .flatMap(page => page.lines)
                .map(line => line.text)
                .join(" ");
            return {result: text, status: "success"};
        }

        return {result: AzureResponses.TEXT_EXTRACTION_ERROR, status: result.status};

    } catch (error) {
        console.error(error);
        return {result: CommonResponseErrorMessages.INTERNAL_IMAGE_PROCESSING_ERROR, status: "error"};
    }
}

async function processBusQueue(connectionString, queueName) {
    const client = await busQueueClient(connectionString, queueName);
    const queueHandlers = new AzureProcessQueueMessages();

    client.subscribe({
        processMessage: queueHandlers.processMessage,
        processError: queueHandlers.processError,
    });
    console.log("Azure Service Bus listener started...");
}


export {extractTextFromImage, processBusQueue};