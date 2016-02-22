var async = require('async');
var db = require('../db/db');
var dbVisibility = require('../db/visibility');
var eventEmitter = require('../events/emitter');
var express = require('express');
var status = require('../util/status');

var router = express.Router();

router.get('/', (req, res) => {
  db.all('SELECT * FROM submissions', [], (err, rows) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json({
      'submissions': rows,
    });
  });
});

router.post('/', (req, res) => {
  async.waterfall([
    (cb) => {
      dbVisibility.get(req.body.teamId, req.body.puzzleId, cb);
    },
    (visibilityStatus, cb) => {
      if (!status.visibilityAllowSubmission(visibilityStatus)) {
        return cb('Puzzle visibility insufficient for submission');
      }
      db.run(
        'INSERT INTO submissions (teamId, puzzleId, submission, timestamp) ' +
          'VALUES (?,?,?,?)',
        [req.body.teamId, req.body.puzzleId, req.body.submission, Date.now()],
        cb);
    }], (err) => {
      if (err) {
        return res.status(400).send(err);
      }
      res.json({'created': true});
    });
});

router.get('/:id', (req, res) => {
  db.get(
    'SELECT * FROM submissions WHERE submissionId = ?',
    [req.params.id],
    (err, row) => {
      if (err) {
        return res.status(500).send(err);
      }
      if (row === undefined) {
        return res.status(404).send('Submission not found');
      }
      res.json(row);
    });
});

router.post('/:id', (req, res) => {
  // TODO: ensure status is valid (shouldn't this be enforced with a reference
  // table in the SQL schema and a foreign key constriant?)
  db.run(
    'UPDATE submissions SET status = ? WHERE submissionId = ? AND status <> ?',
    [req.body.status, req.params.id, req.body.status],
    function(err) {
      if (err) {
        return res.status(400).send(err);
      }
      if (this.changes > 0 && status.submissionIsTerminal(req.body.status)) {
        eventEmitter.emit(
          'SubmissionComplete', {'submissionId': req.params.id});
        res.json({'updated': true});
      } else {
        res.json({'updated': false});
      }
    });
});

module.exports = router;
