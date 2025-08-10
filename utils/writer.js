/**
 * ResponsePayload class
 * @param {number} code - The status code
 * @param {any} payload - The payload
 */
class ResponsePayload {
    constructor(code, payload) {
        this.code = code;
        this.payload = payload;
    }
}

/**
 * Respond with a code and a payload
 * @param {number} code - The status code
 * @param {any} payload - The payload
 * @returns {ResponsePayload} The response payload
 */
exports.respondWithCode = function (code, payload) {
    return new ResponsePayload(code, payload);
};

/**
 * Write a JSON response
 *
 * response Response The response object
 * arg1 Any The payload
 * arg2 Integer The status code
 */
function writeJson(response, arg1, arg2) {
    let code;
    let payload;

    if (arg1 && arg1 instanceof ResponsePayload) {
        writeJson(response, arg1.payload, arg1.code);
        return;
    }

    if (arg2 && Number.isInteger(arg2)) {
        code = arg2;
    } else {
        if (arg1 && Number.isInteger(arg1)) {
            code = arg1;
        }
    }
    if (code && arg1) {
        payload = arg1;
    } else if (arg1) {
        payload = arg1;
    }

    if (!code) {
        // if no response code given, we default to 200
        code = 200;
    }
    if (typeof payload === "object") {
        payload = JSON.stringify(payload, null, 2);
    }
    response.writeHead(code, { "Content-Type": "application/json" });
    response.end(payload);
}

/**
 * Write an image response
 *
 * response Response The response object
 * filePath String The file path
 * mimeType String The mime type (optional)
 */
function writeImage(response, filePath, mimeType = "image/jpeg") {
    const fs = require("fs");
    const path = require("path");

    console.log(response);

    // Vérifiez que le fichier existe
    if (!fs.existsSync(filePath)) {
        response.writeHead(404, { "Content-Type": "text/plain" });
        response.end("Image not found");
        return;
    }

    // Définir le type MIME et lire le fichier
    response.writeHead(200, { "Content-Type": mimeType });
    const stream = fs.createReadStream(filePath);

    // Transférer le contenu du fichier au client
    stream.pipe(response);

    stream.on("error", (err) => {
        console.error("Error streaming image:", err);
        response.writeHead(500, { "Content-Type": "text/plain" });
        response.end("Internal Server Error");
    });
}

/**
 * Check if the request is authenticated
 *
 * req Object The request object
 * @returns {Promise<boolean>} True if the request is authenticated, false otherwise
 */
async function isAuthenticated(req) {
    console.log("Checking auth...");

    const url = "https://api.stack-auth.com/api/v1/users/me";
    const headers = {
        "x-stack-access-type": "server",
        "x-stack-project-id": process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
        "x-stack-secret-server-key": process.env.STACK_SECRET_SERVER_KEY,
        "x-stack-access-token": req.headers["x-stack-access-token"],
    };
    const response = await fetch(url, {
        headers,
    });

    console.log("Auth status: " + response.status);

    return response.status === 200;
}

/**
 * Export the utils
 * @returns {Object} The utils
 */
module.exports = {
    writeJson,
    writeImage,
    isAuthenticated,
};
