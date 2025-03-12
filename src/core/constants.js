const FLIP_TYPES_WORDS = ["vertical", "horizontal", "vert-horiz", "horiz-vert"];
const FLIP_TYPES_LETTERS = ["v", "h", "vh", "hv"];
export const FLIP_TYPES = FLIP_TYPES_WORDS.concat(FLIP_TYPES_LETTERS);
export const IMAGE_FORMATS = ["image/png", "image/jpeg", "image/jpg"];
export const MAX_IMAGE_SIZE_MB = 5
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
