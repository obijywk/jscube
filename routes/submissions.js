var _ = require('underscore');
var async = require('async');
var db = require('../db/db');
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
      db.get(
        'SELECT status FROM visibilities WHERE teamId = ? AND puzzleId = ?',
        [req.body.teamId, req.body.puzzleId],
        cb);
    },
    (visibilityRow, cb) => {
      if (cb === undefined) {
        // There was no visibility row.
        cb = visibilityRow;
        visibilityRow = undefined;
      }
      var visibilityStatus;
      if (visibilityRow) {
        visibilityStatus = visibilityRow.status;
      } else {
        visibilityStatus = status.VISIBILITY_DEFAULT;
      }
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

module.exports = router;
