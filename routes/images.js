let express = require("express");
let router = express.Router();
let utils = require("../utils/writer");
const imageService = require("../services/imagesService");

router.get("/:titleName", async function (req, res) {
    if (await utils.isAuthenticated(req)) {
        imageService
            .getImageByTitle(req.params.titleName)
            .then(function (response) {
                utils.writeImage(res, response);
            })
            .catch(function (error) {
                utils.writeImage(res, error);
            });
    } else {
        res.status(401).json({ error: "Unauthorized" });
    }
});

router.get("/", async function (req, res) {
    console.log("Loading state");
});

module.exports = router;
