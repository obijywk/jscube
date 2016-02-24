var async = require('async');
var db = require('./db').db;

function createPuzzles(puzzleIds, callback) {
  async.each(puzzleIds, (puzzleId, cb) => {
    db.query(
      'INSERT OR IGNORE INTO puzzles (puzzleId) VALUES (?)',
      [puzzleId],
      cb);
  }, callback);
}
module.exports.create = createPuzzles;
