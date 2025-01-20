let express = require('express');
let router = express.Router();
let utils = require('../utils/writer');
const imageService = require('../services/imagesService')

router.get('/:titleName', function (req, res) {
    imageService.getImageByTitle(req.params.titleName)
        .then(function (response) {
            utils.writeImage(res, response);
        })
        .catch(function (error) {
            utils.writeImage(res, error);
        })
})

module.exports = router;