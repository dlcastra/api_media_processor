class ResponsesErrorMessage {
    // Request error messages
    static EMPTY_REQUEST_BODY = "Request body is empty required fields: file, flipType, callbackUrl";
    static NO_FILE_UPLOADED = "No file uploaded";
    static NO_FLIP_TYPE_SPECIFIED = "No flip type specified";
    static INVALID_FLIP_TYPE = "Invalid flip type";

    // File validation error messages
    static IS_NOT_IMAGE_OR_UNSUPPORTED_FORMAT = "File is not an image or is an unsupported image type";
    static FILE_IS_TOO_LARGE = "File is too large";
}

export default ResponsesErrorMessage;