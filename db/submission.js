var _ = require('underscore');
var async = require('async');
var db = require('./db');
var eventEmitter = require('../events/emitter');
var status = require('../util/status');

function listSubmissions(cb) {
  db.all(
    'SELECT * FROM submissions',
    [],
    (err, rows) => {
      if (err) {
        return cb(err);
      }
      _.each(rows, (row) => {
        row.status = status.Submission.get(row.status);
      });
      return cb(null, rows);
    });
}
module.exports.list = listSubmissions;

function getSubmission(submissionId, cb) {
  db.get(
    'SELECT * FROM submissions WHERE submissionId = ?',
    [submissionId],
    (err, row) => {
      if (err) {
        return cb(err);
      }
      if (row === undefined) {
        return cb('Submission id ' + submissionId + ' not found');
      }
      row.status = status.Submission.get(row.status);
      return cb(null, row);
    });
}
module.exports.get = getSubmission;

function createSubmission(teamId, puzzleId, submission, cb) {
  db.run(
    'INSERT INTO submissions (teamId, puzzleId, submission, timestamp) ' +
      'VALUES (?,?,?,?)',
    [teamId, puzzleId, submission, Date.now()],
    cb);
}
module.exports.create = createSubmission;

function updateSubmissionStatus(submissionId, submissionStatus, callback) {
  async.waterfall([
    (cb) => {
      db.run(
        'UPDATE submissions SET status = ? WHERE submissionId = ? AND status <> ?',
        [submissionStatus.key, submissionId, submissionStatus.key],
        function(err) {
          if (err) {
            return cb(err);
          }
          return cb(null, this.changes > 0);
        });
    },
    (changed, cb) => {
      if (changed && submissionStatus.isTerminal) {
        getSubmission(submissionId, (err, submission) => {
          if (err) {
            return cb(err);
          }
          eventEmitter.emit('SubmissionComplete', submission);
          return cb(null, true);
        });
      } else {
        return cb(null, changed);
      }
    }], callback);
}
module.exports.updateStatus = updateSubmissionStatus;
