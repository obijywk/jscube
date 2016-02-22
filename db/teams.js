var _ = require('underscore');
var db = require('./db');

module.exports.listIds = function(runId, cb) {
  db.all(
    'SELECT teamId FROM teams WHERE runId = ?',
    [runId],
    (err, rows) => {
      if (err) {
        return cb(err);
      }
      return cb(null, _.pluck(rows, 'teamId'));
    });
}
