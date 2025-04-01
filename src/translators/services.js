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
        return this.translator === "google" ? await this.useGoogleTranslator() : await this.useDeeplTranslator();
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

    async useDeeplTranslator() {
        return null;
    }
}

export {TranslatorService};
