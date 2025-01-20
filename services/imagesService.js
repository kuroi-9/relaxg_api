'use strict'

const fs = require('fs');

exports.getImageByTitle = function (title) {
    return new Promise(async function (resolve, reject) {
        resolve("/public/" + title);
    });
}