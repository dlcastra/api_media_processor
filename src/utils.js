import axios from "axios";


async function streamToBuffer(stream) {
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks);
}


async function callback(callbackUrl, status, data) {
    try {
        if (typeof data !== "object" || data === null) {
            console.error("Invalid data type.");
            await axios.post(callbackUrl, {error: "Callback: Invalid data type.", status: "error"});
            return {status: "error"};
        }

        data.status = status;
        await axios.post(callbackUrl, data);
        return {status: status};

    } catch (error) {
        const errorMessage = error?.response?.data || error.message || "Unknown error";
        console.error("Callback error:", errorMessage);
        await axios.post(callbackUrl, {error: errorMessage, status: "error"});
        return {status: "error", error: "Unexpected internal error."};
    }
}


export {streamToBuffer, callback};
