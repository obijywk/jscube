var _ = require('underscore');
var async = require('async');
var db = require('./db');
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
        return cb(null, status.VISIBILITY_DEFAULT);
      }
      return cb(null, row.status);
    });
}

module.exports.update = function(teamId, puzzleId, visibility, callback) {
  async.waterfall([
    (cb) => {
      db.run(
        'INSERT OR IGNORE INTO visibilities (teamId, puzzleId) ' +
          'VALUES (?, ?)',
        [teamId, puzzleId],
        cb);
    },
    (cb) => {
      var allowedAntecedents = status.visibilityAllowedAntecedents(visibility);
      var antecedentCondition = _.map(
        allowedAntecedents,
        (value) => { return 'status = "' + value + '"'; })
        .join(' OR ');
      db.run(
        'UPDATE visibilities SET status = ? ' +
          'WHERE teamId = ? AND puzzleId = ? AND (' +
          antecedentCondition + ')',
        [visibility, teamId, puzzleId],
        function(err) {
          if (err) {
            return cb(err);
          }
          return cb(null, this.changes > 0);
        });
    }], callback);
}
