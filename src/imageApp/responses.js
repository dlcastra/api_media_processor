class ResponseErrorMessages {
    // Request error messages
    static EMPTY_REQUEST_BODY = "Request body is empty required fields: ";
    static NO_CALLBACK_URL = "No callback URL specified";
    static NO_FILE_UPLOADED = "No file uploaded";
    static NO_FLIP_TYPE_SPECIFIED = "No flip type specified";
    static NO_LANG_TO_SPECIFIED = "Missed language to translate to. Required field: lang_to";
    static INVALID_FLIP_TYPE = "Invalid flip type";

    // File validation error messages
    static IS_NOT_IMAGE_OR_UNSUPPORTED_FORMAT = "File is not an image or is an unsupported image type";
    static FILE_IS_TOO_LARGE = "File is too large";

    static getEmptyRequestBodyMessage(fields) {
        return `${this.EMPTY_REQUEST_BODY}${fields},callbackUrl`;
    }
}

export default ResponseErrorMessages;