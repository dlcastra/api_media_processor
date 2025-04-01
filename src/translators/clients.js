import {TranslationServiceClient} from '@google-cloud/translate';
import {readFileSync} from 'fs';

import {AppSettings} from '../core/settings.js';


const googleCredentials = JSON.parse(readFileSync(AppSettings.GOOGLE_APPLICATION_CREDENTIALS));
const googleTranslatorClient = new TranslationServiceClient({credentials: googleCredentials});


export {googleTranslatorClient};