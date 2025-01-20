var ResponsePayload = function (code, payload) {
    this.code = code;
    this.payload = payload;
}

exports.respondWithCode = function (code, payload) {
    return new ResponsePayload(code, payload);
}

const writeJson = exports.writeJson = function (response, arg1, arg2) {
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
    if (typeof payload === 'object') {
        payload = JSON.stringify(payload, null, 2);
    }
    response.writeHead(code, {'Content-Type': 'application/json'});
    response.end(payload);
}

const writeImage = exports.writeImage = function(response, filePath, mimeType = 'image/jpeg') {
    const fs = require('fs');
    const path = require('path');

    console.log(response)

    // Vérifiez que le fichier existe
    if (!fs.existsSync(filePath)) {
        response.writeHead(404, { 'Content-Type': 'text/plain' });
        response.end('Image not found');
        return;
    }

    // Définir le type MIME et lire le fichier
    response.writeHead(200, { 'Content-Type': mimeType });
    const stream = fs.createReadStream(filePath);

    // Transférer le contenu du fichier au client
    stream.pipe(response);

    stream.on('error', (err) => {
        console.error('Error streaming image:', err);
        response.writeHead(500, { 'Content-Type': 'text/plain' });
        response.end('Internal Server Error');
    });
};