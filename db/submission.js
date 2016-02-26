var _ = require('underscore');
var async = require('async');
var db = require('./db').db;
var eventEmitter = require('../events/emitter');
var status = require('../util/status');

function listSubmissions(cb) {
  db.query(
    'SELECT * FROM submissions',
    (err, result) => {
      if (err) {
        return cb(err);
      }
      _.each(result.rows, (row) => {
        row.status = status.Submission.get(row.status);
      });
      return cb(null, result.rows);
    });
}
module.exports.list = listSubmissions;

function getSubmission(submissionId, cb) {
  db.query(
    'SELECT * FROM submissions WHERE submissionId = ?',
    [submissionId],
    (err, result) => {
      if (err) {
        return cb(err);
      }
      if (result.rowCount == 0) {
        return cb(new Error('Submission id ' + submissionId + ' not found'));
      }
      var row = result.rows[0];
      row.status = status.Submission.get(row.status);
      return cb(null, row);
    });
}
module.exports.get = getSubmission;

function createSubmission(teamId, puzzleId, submission, cb) {
  db.query(
    'INSERT INTO submissions (teamId, puzzleId, submission, timestamp) ' +
      'VALUES (?,?,?,?)',
    [teamId, puzzleId, submission, Date.now()],
    cb);
}
module.exports.create = createSubmission;

function updateSubmissionStatus(submissionId, submissionStatus, callback) {
  async.waterfall([
    (cb) => {
      db.query(
        'UPDATE submissions SET status = ? WHERE submissionId = ? AND status <> ?',
        [submissionStatus.key, submissionId, submissionStatus.key],
        (err, result) => {
          if (err) {
            return cb(err);
          }
          return cb(null, result.rowCount > 0);
        });
    },
    (changed, cb) => {
      if (changed && submissionStatus.isTerminal) {
        getSubmission(submissionId, (err, submission) => {
          if (err) {
            return cb(err);
          }
          submission.eventType = 'SubmissionComplete';
          eventEmitter.emit('SubmissionComplete', submission);
          return cb(null, true);
        });
      } else {
        return cb(null, changed);
      }
    }], callback);
}
module.exports.updateStatus = updateSubmissionStatus;
