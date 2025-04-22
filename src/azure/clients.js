import {ComputerVisionClient} from "@azure/cognitiveservices-computervision";
import {CognitiveServicesCredentials} from "@azure/ms-rest-azure-js";
import {ServiceBusClient} from "@azure/service-bus";

import {AppSettings} from "../core/settings.js";


const endpoint = AppSettings.AZURE_OCR_ENDPOINT
const apiKey = AppSettings.AZURE_OCR_SECRET_KEY;

const ocrClient = async () => {
    const credentials = new CognitiveServicesCredentials(apiKey);
    return new ComputerVisionClient(credentials, endpoint);
};

const busQueueClient = async (connectionString, queueName) => {
    const client = new ServiceBusClient(connectionString);
    return client.createReceiver(queueName);
}

export {ocrClient, busQueueClient};