var async = require('async');
var dbSubmission = require('../db/submission');
var dbVisibility = require('../db/visibility');
var express = require('express');
var status = require('../util/status');

var router = express.Router();

router.get('/', (req, res) => {
  dbSubmission.list((err, submissions) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json({
      'submissions': submissions,
    });
  });
});

router.post('/', (req, res) => {
  async.waterfall([
    (cb) => {
      dbVisibility.get(req.body.teamId, req.body.puzzleId, cb);
    },
    (visibility, cb) => {
      if (!visibility.allowSubmission) {
        return cb('Puzzle visibility insufficient for submission');
      }
      dbSubmission.create(
        req.body.teamId,
        req.body.puzzleId,
        req.body.submission,
        cb);
    }], (err) => {
      if (err) {
        return res.status(400).send(err);
      }
      res.json({'created': true});
    });
});

router.get('/:id', (req, res) => {
  dbSubmission.get(req.params.id, (err, submission) => {
    if (err) {
      return res.status(400).send(err);
    }
    res.json(submission);
  });
});

router.post('/:id', (req, res) => {
  var submissionStatus = status.Submission.get(req.body.status);
  dbSubmission.updateStatus(req.params.id, submissionStatus, (err, updated) => {
    if (err) {
      return res.status(400).send(err);
    }
    res.json({'updated': updated});
  });
});

module.exports = router;
