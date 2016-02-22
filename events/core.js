var async = require('async');
var db = require('../db/db');
var dbTeams = require('../db/teams');
var dbVisibility = require('../db/visibility');
var eventEmitter = require('./emitter');
var status = require('../util/status');

eventEmitter.on('HuntStart', (params) => {
  db.run(
    'UPDATE runs SET startTimestamp = ? ' +
      'WHERE runId = ? AND startTimestamp IS NULL',
    [Date.now(), params.runId],
    function(err) {
      if (err) {
        console.log('HuntStart failed: ' + err);
      }
      if (this.changes == 0) {
        console.log('HuntStart did not cause an update');
      }
    });
});

eventEmitter.on('FullRelease', (params) => {
  async.waterfall([
    (cb) => {
      dbTeams.listIds(params.runId, cb);
    },
    (teamIds, cb) => {
      async.each(teamIds, (teamId, cb) => {
        dbVisibility.update(
          teamId,
          params.puzzleId,
          new status.VisibilityStatus('UNLOCKED'),
          cb);
      }, cb);
    }], (err) => {
      if (err) {
        console.log('FullRelease failed: ' + err);
      }
    });
});
