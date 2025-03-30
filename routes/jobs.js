let express = require("express");
let router = express.Router();
let utils = require("../utils/writer");
const jobsService = require("../services/jobsService");

/**
 * Fill the history/{title}/jobs page
 *
 * page Integer Number of elements to skip before returning the results (optional)
 * limit Integer Maximum number of elements to return (optional)
 * returns List
 **/
router.get("/", async function (req, res, next) {
    if (await utils.isAuthenticated(req)) {
        jobsService
            .jobsGET(req, res)
            .then(function (response) {
                utils.writeJson(res, response);
            })
            .catch(function (response) {
                utils.writeJson(res, response);
            });
    } else {
        res.status(401).json({ error: "Unauthorized" });
    }
});

/**
 * Create a new ssh tunnel to resume a job
 *
 * job_id String The job identifier
 * returns Job
 **/
router.post("/resume/", async function (req, res, next) {
    if (await utils.isAuthenticated(req)) {
        jobsService
            .jobs_jobResumePOST(req.body)
            .then(function (response) {
            utils.writeJson(res, response);
        })
            .catch(function (response) {
                utils.writeJson(res, response);
            });
    } else {
        res.status(401).json({ error: "Unauthorized" });
    }
});

/**
 * Send a CTRL+C signal to the ssh tunnel used for the job
 *
 * body Job  (optional)
 * no response value expected for this operation
 **/
router.post("/stop/", async function (req, res, next) {
    if (await utils.isAuthenticated(req)) {
        jobsService
            .jobs_jobStopPOST(req.body)
            .then(function (response) {
            utils.writeJson(res, response);
        })
            .catch(function (response) {
                utils.writeJson(res, response);
            });
    } else {
        res.status(401).json({ error: "Unauthorized" });
    }
});

/**
 * Delete a job
 *
 * body Job  (optional)
 * no response value expected for this operation
 */
router.post("/delete/", async function (req, res, next) {
    if (await utils.isAuthenticated(req)) {
        jobsService
            .jobs_jobDeletePOST(req.body)
            .then(function (response) {
            utils.writeJson(res, response);
        })
            .catch(function (response) {
                utils.writeJson(res, response);
            });
    } else {
        res.status(401).json({ error: "Unauthorized" });
    }
});

/**
 * Add a new job to the manager and put a title in a \"working\" state, the job starts right away
 *
 * body Job  (optional)
 * no response value expected for this operation
 **/
router.post("/", async function (req, res, next) {
    if (await utils.isAuthenticated(req)) {
        jobsService
            .jobsPOST(req.body)
            .then(function (response) {
            utils.writeJson(res, response);
        })
            .catch(function (response) {
                utils.writeJson(res, response);
            });
    } else {
        res.status(401).json({ error: "Unauthorized" });
    }
});

module.exports = router;
