var async = require('async');
var db = require('./db').db;
var errorUtil = require('../util/error');

function createPuzzles(puzzleIds, callback) {
  async.each(puzzleIds, (puzzleId, cb) => {
    db.query(
      'INSERT OR IGNORE INTO puzzles (puzzleId) VALUES (?)',
      [puzzleId],
      cb);
  }, callback);
}
module.exports.create = createPuzzles;

function puzzleExists(puzzleId, callback) {
  db.query(
    'SELECT puzzleId FROM puzzles WHERE puzzleId = ?',
    [puzzleId],
    (err, result) => {
      errorUtil.thrower(err);
      callback(null, result.rows.length > 0);
    });
}
module.exports.exists = puzzleExists;
