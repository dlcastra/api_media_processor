import sharp from "sharp";


class ImageFlipperService {
    constructor(buffer, fileFormat, flipType) {
        this.buffer = buffer;
        this.fileFormat = fileFormat;
        this.flipType = flipType.replaceAll("/\s/g", "").toLowerCase();
    }

    async invert() {
        if (this.flipType === "vertical" || this.flipType === "v") {
            this.buffer = await this.invertVertical();
        } else if (this.flipType === "horizontal" || this.flipType === "h") {
            this.buffer = await this.invertHorizontal();
        } else if (this.flipType === "vert-horiz" || this.flipType === "vh") {
            this.buffer = await this.invertVertical();
            this.buffer = await this.invertHorizontal();
        } else if (this.flipType === "horiz-vert" || this.flipType === "hv") {
            this.buffer = await this.invertHorizontal();
            this.buffer = await this.invertVertical();
        }

        return await this.compressImage();
    }

    async invertHorizontal() {
        return await sharp(this.buffer).flop().toBuffer();
    }

    async invertVertical() {
        return await sharp(this.buffer).flip().toBuffer();
    }

    async compressImage() {
        let image = sharp(this.buffer);
        if (this.fileFormat.includes(["jpeg", "jpg"])) {
            image = image.jpeg({quality: 90});
        } else if (this.fileFormat.includes("png")) {
            image = image.png({compressionLevel: 9});
        }

        return await image.toBuffer();
    }
}


const getImageFlipperService = async (file, fileFormat, flipType) => {
    return new ImageFlipperService(file, fileFormat, flipType);
}


export {getImageFlipperService};
