var _ = require('underscore');
var async = require('async');
var db = require('./db').db;
var eventEmitter = require('../events/emitter');
var status = require('../util/status');

function listVisibilities(teamId, puzzleId, cb) {
  var query = 'SELECT teamId, puzzleId, status FROM visibilities';
  var params = [];
  if (teamId != null && puzzleId != null) {
    query += ' WHERE teamId = ? AND puzzleId = ?';
    params.push(teamId);
    params.push(puzzleId);
  } else if (teamId != null) {
    query += ' WHERE teamId = ?';
    params.push(teamId);
  } else if (puzzleId != null) {
    query += ' WHERE puzzleId = ?';
    params.push(puzzleId);
  }
  db.query(query, params, (err, result) => {
    if (err) {
      return cb(err);
    }
    _.each(result.rows, (row) => {
      row.status = status.Visibility.get(row.status);
    });
    return cb(null, result.rows);
  });
}
module.exports.list = listVisibilities;

function listVisibilityHistory(teamId, puzzleId, queryStatus, cb) {
  var query = 'SELECT teamId, puzzleId, status, timestamp FROM visibility_history';
  if (teamId != null || puzzleId != null || queryStatus != null) {
    query += ' WHERE ';
    var params = [];
    var whereClauses = [];
    if (teamId != null) {
      whereClauses.push('teamId = ?');
      params.push(teamId);
    }
    if (puzzleId != null) {
      whereClauses.push('puzzleId = ?');
      params.push(puzzleId);
    }
    if (queryStatus != null) {
      whereClauses.push('status = ?');
      params.push(queryStatus.key);
    }
    query += whereClauses.join(' AND ');
  }
  query += ' ORDER BY timestamp';
  db.query(query, params, (err, result) => {
    if (err) {
      return cb(err);
    }
    _.each(result.rows, (row) => {
      row.status = status.Visibility.get(row.status);
    });
    return cb(null, result.rows);
  });
}
module.exports.listHistory = listVisibilityHistory;

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
          'eventType': 'VisibilityChange',
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
