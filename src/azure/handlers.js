import {AzureResponses} from "./responses.js"
import {CommonResponseErrorMessages} from "../responses.js";
import {ocrClient} from "./clients.js";


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
            return {result: text, status: result.status};
        }

        return {result: AzureResponses.TEXT_EXTRACTION_ERROR, status: result.status};

    } catch (error) {
        console.error(error);
        return {result: CommonResponseErrorMessages.INTERNAL_IMAGE_PROCESSING_ERROR, status: "error"};
    }
}


export {extractTextFromImage};