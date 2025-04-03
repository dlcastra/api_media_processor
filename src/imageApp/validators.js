import {FLIP_TYPES, IMAGE_FORMATS, MAX_IMAGE_SIZE_MB, MAX_IMAGE_SIZE_BYTES} from "../core/constants.js";
import ResponseErrorMessages from "./responses.js";


const REM = ResponseErrorMessages;

class ValidateRequestBody {
    constructor(request, requiredFields) {
        this.buffer = request.file?.buffer || request.body.file?.buffer;
        this.requiredFields = requiredFields || [];
        this.errors = {};
    }

    async validate() {
        this.errors = {};
        if (await this.hasEmptyFields()) return this.errors;

        return null;
    }

    async hasEmptyFields() {
        const emptyRequestBody = await this.noRequestBody();
        if (emptyRequestBody) return true;

        return await this.noFileUploaded();
    }

    async noRequestBody() {
        if (!this.buffer) {
            this.errors.request = {message: REM.getEmptyRequestBodyMessage(this.requiredFields)};
            return true;
        }
        return false;
    }

    async noFileUploaded() {
        if (!this.buffer) {
            this.errors.file = {message: REM.getEmptyRequestBodyMessage()};
            return true;
        }
        return false;
    }
}

class ValidateImage {
    constructor(request) {
        this.buffer = request.file?.buffer || request.body.file?.buffer;
        this.fileFormat = request.file?.mimetype || request.body.file?.contentType;
        this.errors = {};
    }

    async validate() {
        this.errors = {};
        const isUnsupported = await this.isNotImageOrUnsupportedFormat();
        if (isUnsupported) return this.errors;

        const isTooLarge = await this.fileIsTooLarge();
        if (isTooLarge) return this.errors;

        return null;
    }

    async isNotImageOrUnsupportedFormat() {
        if (!IMAGE_FORMATS.includes(this.fileFormat)) {
            this.errors.file = {
                message: REM.IS_NOT_IMAGE_OR_UNSUPPORTED_FORMAT,
                validFormats: IMAGE_FORMATS
            };
            return true;
        }
        return false;
    }

    async fileIsTooLarge() {
        if (this.buffer.length > MAX_IMAGE_SIZE_BYTES) {
            this.errors.file = {
                message: REM.FILE_IS_TOO_LARGE,
                maxSize: `${MAX_IMAGE_SIZE_MB} MB`
            };
            return true;
        }
        return false;
    }
}

class ImageFlipRequestValidator {
    constructor(request) {
        this.requestBodyValidator = new ValidateRequestBody(request, ["file", "flipType"]);
        this.imageValidator = new ValidateImage(request);
        this.flipType = request.body.flipType?.replaceAll(/\s/g, "").toLowerCase();
        this.errors = {};
    }

    async validate() {
        const bodyErrors = await this.requestBodyValidator.validate();
        if (bodyErrors) {
            return bodyErrors;
        }

        const imageErrors = await this.imageValidator.validate();
        if (imageErrors) {
            return imageErrors;
        }

        if (await this.invalidFlipType()) return this.errors;
        if (await this.noFlipTypeSpecified()) return this.errors;

        return null;
    }

    async invalidFlipType() {
        if (this.flipType && !FLIP_TYPES.includes(this.flipType)) {
            this.errors.flipType = {
                message: REM.INVALID_FLIP_TYPE,
                validTypes: FLIP_TYPES
            };
            return true;
        }
        return false;
    }

    async noFlipTypeSpecified() {
        if (!this.flipType) {
            this.errors.flipType = {message: REM.NO_FLIP_TYPE_SPECIFIED};
            return true;
        }
        return false;
    }
}

class ImageTextExtractorRequestValidator {
    constructor(request) {
        this.requestBodyValidator = new ValidateRequestBody(request, ["file", "translator", "lang_to"]);
        this.imageValidator = new ValidateImage(request);
        this.request = request.body;
        this.errors = {};
    }

    async validate() {
        const bodyErrors = await this.requestBodyValidator.validate();
        if (bodyErrors) return bodyErrors;

        const imageErrors = await this.imageValidator.validate();
        if (imageErrors) return imageErrors;

        const noLangToSpecified = await this.noLangToSpecified();
        if (noLangToSpecified) return this.errors;

        return null;
    }

    async noLangToSpecified() {
        if (this.request.translator && !this.request.lang_to) {
            this.errors.lang_to = {message: REM.NO_LANG_TO_SPECIFIED};
            return true;
        }
        return false;
    }
}

const getImageFlipValidator = async (request) => {
    return new ImageFlipRequestValidator(request);
};

const getImageTextExtractorValidator = async (request) => {
    return new ImageTextExtractorRequestValidator(request);
};

export {getImageFlipValidator, getImageTextExtractorValidator};
