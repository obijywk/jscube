var _ = require('underscore');
var db = require('./db').db;
var errorUtil = require('../util/error');
var util = require('util');

module.exports.forEachTeamId = function(runId, cb) {
  db.query(
    'SELECT teamId FROM teams WHERE runId = ?',
    [runId],
    (err, result) => {
      errorUtil.thrower(err);
      _.each(_.pluck(result.rows, 'teamId'), cb);
    });
}
