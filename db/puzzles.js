var async = require('async');
var db = require('./db');

module.exports.create = function(puzzleIds) {
  async.each(puzzleIds, (puzzleId, cb) => {
    db.run(
      'INSERT OR IGNORE INTO puzzles (puzzleId) VALUES (?)',
      [puzzleId],
      cb);
  });
}
