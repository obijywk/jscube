var _ = require('underscore');
var async = require('async');
var db = require('./db').db;
var eventEmitter = require('../events/emitter');
var status = require('../util/status');

function getVisibility(teamId, puzzleId, cb) {
  db.query(
    'SELECT status FROM visibilities WHERE teamId = ? AND puzzleId = ?',
    [teamId, puzzleId],
    (err, result) => {
      if (err) {
        return cb(err);
      }
      if (result.rowCount == 0) {
        return cb(null, status.Visibility.DEFAULT);
      }
      return cb(null, status.Visibility.get(result.rows[0].status));
    });
}
module.exports.get = getVisibility;

function updateVisibility(teamId, puzzleId, visibility, callback) {
  async.waterfall([
    (cb) => {
      // Create row with default visibility status, if it doesn't already exist.
      db.query(
        'INSERT OR IGNORE INTO visibilities (teamId, puzzleId) ' +
          'VALUES (?, ?)',
        [teamId, puzzleId],
        cb);
    },
    (result, cb) => {
      var allowedAntecedents = _.pluck(visibility.allowedAntecedents, 'key');
      var antecedentCondition = _.map(
        allowedAntecedents,
        (value) => { return 'status = "' + value + '"'; })
        .join(' OR ');
      db.query(
        'UPDATE visibilities SET status = ? ' +
          'WHERE teamId = ? AND puzzleId = ? AND (' +
          antecedentCondition + ')',
        [visibility.key, teamId, puzzleId],
        (err, result) => {
          if (err) {
            return cb(err);
          }
          return cb(null, result.rowCount > 0);
        });
    },
    (changed, cb) => {
      if (changed) {
        eventEmitter.emit('VisibilityChange', {
          'teamId': teamId,
          'puzzleId': puzzleId,
          'status': visibility,
        });
        db.query(
          'INSERT INTO visibility_history ' +
            '(teamId, puzzleId, status, timestamp) ' +
            'VALUES (?, ?, ?, ?)',
          [teamId, puzzleId, visibility.key, Date.now()],
          (err) => {
            if (err) {
              return cb(err);
            }
            return cb(null, true);
          });
      } else {
        return cb(null, false);
      }
    }], callback);
}
module.exports.update = updateVisibility;
