import {v4 as uuidv4} from "uuid";

import axios from "axios";

import {AppSettings} from "../core/settings.js";
import {googleTranslatorClient} from "./clients.js";


class TranslatorService {
    constructor(text, lang_to, lang_from = "en", translator = "google") {
        this.text = text;
        this.lang_from = lang_from;
        this.lang_to = lang_to;
        this.translator = translator;
    }

    async translate() {
        if (this.translator === "google") return await this.useGoogleTranslator()
        else if (this.translator === "azure") return await this.useAzureTranslator();

        return "Could not find translator, please choose the available ones: google or azure";
    }

    async useGoogleTranslator() {
        const projectId = AppSettings.GOOGLE_PROJECT_ID;
        const location = "global";

        const request = {
            parent: `projects/${projectId}/locations/${location}`,
            contents: [this.text],
            mimeType: "text/plain",
            sourceLanguageCode: this.lang_from,
            targetLanguageCode: this.lang_to,
        };

        const [response] = await googleTranslatorClient.translateText(request);
        return response.translations[0].translatedText;
    }

    async useAzureTranslator() {
        const with_lang_from_url = `${AppSettings.AZURE_TRANSLATOR_ENDPOINT}?api-version=3.0&from=${this.lang_from}&to=${this.lang_to}`;
        const without_lang_from_url = `${AppSettings.AZURE_TRANSLATOR_ENDPOINT}?api-version=3.0&to=${this.lang_to}`;
        const response = await axios.post(
            this.lang_from ? with_lang_from_url : without_lang_from_url,
            [{text: this.text}],
            {
                headers: {
                    "Ocp-Apim-Subscription-Key": AppSettings.AZURE_TRANSLATOR_SECRET_KEY,
                    "Ocp-Apim-Subscription-Region": AppSettings.AZURE_TRANSLATOR_LOCATION,
                    "Content-Type": "application/json",
                    "X-ClientTraceId": uuidv4().toString(),
                },
                responseType: "json",
            }
        );

        return response.data[0].translations[0].text;
    }
}

export {TranslatorService};
