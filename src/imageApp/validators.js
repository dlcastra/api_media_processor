import {FLIP_TYPES, IMAGE_FORMATS, MAX_IMAGE_SIZE_MB, MAX_IMAGE_SIZE_BYTES} from "../core/constants.js";
import ResponsesErrorMessage from "./responses.js";


const REM = ResponsesErrorMessage;

class ValidateRequestBody {
    constructor(request) {
        this.buffer = request.file?.buffer || request.body.file?.buffer;
        this.flipType = request.body.flipType?.replaceAll(/\s/g, "").toLowerCase();
        this.errors = {};
    }

    async validate() {
        this.errors = {};

        const hasEmptyFields = await this.hasEmptyFields();
        const invalidFlipType = await this.invalidFlipType();

        if (hasEmptyFields || invalidFlipType) {
            return this.errors;
        }

        return null;
    }

    async hasEmptyFields() {
        const emptyRequestBody = await this.noRequestBody();
        if (emptyRequestBody) return true;

        const emptyFileField = await this.noFileUploaded();
        const emptyFlipType = await this.noFlipTypeSpecified();

        return emptyFileField || emptyFlipType;
    }

    async noRequestBody() {
        if (!this.buffer && !this.flipType) {
            this.errors.request = {message: REM.EMPTY_REQUEST_BODY};
            return true;
        }
        return false;
    }

    async noFileUploaded() {
        if (!this.buffer) {
            this.errors.file = {message: REM.NO_FILE_UPLOADED};
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
        this.requestBodyValidator = new ValidateRequestBody(request);
        this.imageValidator = new ValidateImage(request);
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

        return null;
    }
}

const getImageValidator = async (request) => {
    return new ImageFlipRequestValidator(request);
};

export default getImageValidator
