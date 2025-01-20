let express = require('express');
let router = express.Router();
let utils = require('../utils/writer');
let titlesService = require('../services/titlesService');

/**
 * List all titles of a job
 *
 * job_id String The job identifier
 * page Integer Number of elements to skip before returning the results (optional)
 * limit Integer Maximum number of elements to return (optional)
 * returns List
 **/


/**
 * Get a single title from its id
 *
 * title_id Integer The title identifier
 * returns object
 **/

router.get('/:titleId', function (req, res, next) {
    titlesService.titles_titleGET(req.params.titleId)
        .then(function (response) {
            utils.writeJson(res, response);
        })
        .catch(function (response) {
            utils.writeJson(res, response);
        })
})

/**
 * Update job titles list
 *
 * body List  (optional)
 * job_id String The job identifier
 * no response value expected for this operation
 **/

/**
 * Sync host available titles with the database and provide the list of all titles.
 *
 * page Integer Number of elements to skip before returning the results (optional)
 * limit Integer Maximum number of elements to return (optional)
 * returns List
 **/
router.get('/', function (req, res, next) {
    titlesService.titlesGET(req, res)
        .then(function (response) {
            utils.writeJson(res, response);
        })
        .catch(function (response) {
            utils.writeJson(res, response);
        })
});

module.exports = router;