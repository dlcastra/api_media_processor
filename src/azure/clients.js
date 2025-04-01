import {ComputerVisionClient} from "@azure/cognitiveservices-computervision";
import {CognitiveServicesCredentials} from "@azure/ms-rest-azure-js";

import {AppSettings} from "../core/settings.js";


const endpoint = AppSettings.AZURE_OCR_ENDPOINT
const apiKey = AppSettings.AZURE_OCR_SECRET_KEY;

const ocrClient = async () => {
    const credentials = new CognitiveServicesCredentials(apiKey);
    return new ComputerVisionClient(credentials, endpoint);
};


export {ocrClient};