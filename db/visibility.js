var _ = require('underscore');
var async = require('async');
var db = require('./db');
var dbTeams = require('./teams');
var status = require('../util/status');

module.exports.get = function(teamId, puzzleId, cb) {
  db.get(
    'SELECT status FROM visibilities WHERE teamId = ? AND puzzleId = ?',
    [teamId, puzzleId],
    (err, row) => {
      if (err) {
        return cb(err);
      }
      if (!row) {
        return cb(null, status.VisibilityStatus.getDefault());
      }
      return cb(null, new status.VisibilityStatus(row.status));
    });
}

module.exports.update = function(teamId, puzzleId, visibilityStatus, callback) {
  async.waterfall([
    (cb) => {
      // Create row with default visibility status, if it doesn't already exist.
      db.run(
        'INSERT OR IGNORE INTO visibilities (teamId, puzzleId) ' +
          'VALUES (?, ?)',
        [teamId, puzzleId],
        cb);
    },
    (cb) => {
      var allowedAntecedents = visibilityStatus.getAllowedAntecedentValues();
      var antecedentCondition = _.map(
        allowedAntecedents,
        (value) => { return 'status = "' + value + '"'; })
        .join(' OR ');
      db.run(
        'UPDATE visibilities SET status = ? ' +
          'WHERE teamId = ? AND puzzleId = ? AND (' +
          antecedentCondition + ')',
        [visibilityStatus.value, teamId, puzzleId],
        function(err) {
          if (err) {
            return cb(err);
          }
          return cb(null, this.changes > 0);
        });
    }], callback);
}

module.exports.updateForAllTeams = function(
  runId, puzzleId, visibilityStatus, callback) {
  async.waterfall([
    (cb) => {
      dbTeams.listIds(runId, cb);
    },
    (teamIds, cb) => {
      async.each(teamIds, (teamId, cb) => {
        module.exports.update(
          teamId,
          puzzleId,
          visibilityStatus,
          cb);
      }, cb);
    }], callback);
}
