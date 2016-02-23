var _ = require('underscore');
var async = require('async');
var db = require('./db');
var eventEmitter = require('../events/emitter');
var status = require('../util/status');

function getVisibility(teamId, puzzleId, cb) {
  db.get(
    'SELECT status FROM visibilities WHERE teamId = ? AND puzzleId = ?',
    [teamId, puzzleId],
    (err, row) => {
      if (err) {
        return cb(err);
      }
      if (!row) {
        return cb(null, status.Visibility.DEFAULT);
      }
      return cb(null, status.Visibility.get(row.status));
    });
}
module.exports.get = getVisibility;

function updateVisibility(teamId, puzzleId, visibility, callback) {
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
      var allowedAntecedents = _.pluck(visibility.allowedAntecedents, 'key');
      var antecedentCondition = _.map(
        allowedAntecedents,
        (value) => { return 'status = "' + value + '"'; })
        .join(' OR ');
      db.run(
        'UPDATE visibilities SET status = ? ' +
          'WHERE teamId = ? AND puzzleId = ? AND (' +
          antecedentCondition + ')',
        [visibility.key, teamId, puzzleId],
        function(err) {
          if (err) {
            return cb(err);
          }
          return cb(null, this.changes > 0);
        });
    },
    (changed, cb) => {
      if (changed) {
        eventEmitter.emit('VisibilityChange', {
          'teamId': teamId,
          'puzzleId': puzzleId,
          'status': visibility,
        });
        db.run(
          'INSERT INTO visibility_history ' +
            '(teamId, puzzleId, status, timestamp) ' +
            'VALUES (?, ?, ?, ?)',
          [teamId, puzzleId, visibility.key, Date.now()],
          (err) => {
            if (err) {
              return cb(err);
            } else {
              return cb(null, true);
            }
          });
      } else {
        return cb(null, false);
      }
    }], callback);
}
module.exports.update = updateVisibility;
