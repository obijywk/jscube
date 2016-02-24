var async = require('async');
var db = require('../db/db').db;
var dbTeams = require('../db/teams');
var dbVisibility = require('../db/visibility');
var errorUtil = require('../util/error');
var eventEmitter = require('./emitter');
var status = require('../util/status');
var unlock = require('../util/unlock');
var util = require('util');

eventEmitter.on('HuntStart', (params) => {
  db.query(
    'UPDATE runs SET startTimestamp = ? ' +
      'WHERE runId = ? AND startTimestamp IS NULL',
    [Date.now(), params.runId],
    (err, result) => {
      errorUtil.thrower(err);
      if (result.rowCount == 0) {
        util.log('HuntStart did not cause an update');
      }
    });
});

eventEmitter.on('SubmissionComplete', (submission) => {
  if (submission.status != status.Submission.CORRECT) {
    return;
  }
  dbVisibility.update(
    submission.teamId,
    submission.puzzleId,
    status.Visibility.SOLVED,
    errorUtil.thrower);
});

eventEmitter.on('FullRelease', (params) => {
  unlock.forAllTeams(params.runId, params.puzzleId);
});
