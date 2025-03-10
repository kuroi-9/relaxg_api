let express = require('express');
let router = express.Router();
let utils = require('../utils/writer');
const jobsService = require('../services/jobsService');

/**
 * Fill the history/{title}/jobs page
 *
 * page Integer Number of elements to skip before returning the results (optional)
 * limit Integer Maximum number of elements to return (optional)
 * returns List
 **/
router.get('/', function (req, res, next) {
    jobsService.jobsGET(req, res)
        .then(function (response) {
            utils.writeJson(res, response);
        })
        .catch(function (response) {
            utils.writeJson(res, response);
        })
});

/**
 * Create a new ssh tunnel to resume a job
 *
 * job_id String The job identifier
 * returns Job
 **/
router.post('/resume/', function (req, res, next) {
    jobsService.jobs_jobResumePOST(req.body)
        .then(function (response) {
            utils.writeJson(res, response);
        })
        .catch(function (response) {
            utils.writeJson(res, response);
        })
})

/**
 * Send a CTRL+C signal to the ssh tunnel used for the job
 *
 * body Job  (optional)
 * no response value expected for this operation
 **/
router.post('/stop/', function (req, res, next) {
    jobsService.jobs_jobStopPOST(req.body)
        .then(function (response) {
            utils.writeJson(res, response);
        })
        .catch(function (response) {
            utils.writeJson(res, response);
        })
})

/**
 * Delete a job
 * 
 * body Job  (optional)
 * no response value expected for this operation
 */
router.post('/delete/', function (req, res, next) {
    jobsService.jobs_jobDeletePOST(req.body)
        .then(function (response) {
            utils.writeJson(res, response);
        })
        .catch(function (response) {
            utils.writeJson(res, response);
        })
})

/**
 * Add a new job to the manager and put a title in a \"working\" state, the job starts right away
 *
 * body Job  (optional)
 * no response value expected for this operation
 **/
router.post('/', function (req, res, next) {
    jobsService.jobsPOST(req.body)
        .then(function (response) {
            utils.writeJson(res, response);
        })
        .catch(function (response) {
            utils.writeJson(res, response);
        })
});

module.exports = router;