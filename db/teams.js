var _ = require('underscore');
var db = require('./db');
var util = require('util');

module.exports.forEachTeamId = function(runId, cb) {
  db.all(
    'SELECT teamId FROM teams WHERE runId = ?',
    [runId],
    (err, rows) => {
      if (err) {
        throw err;
      }
      _.each(_.pluck(rows, 'teamId'), cb);
    });
}
