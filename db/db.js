var anyDb = require('any-db');
var async = require('async');
var config = require('config');
var status = require('../util/status');
var util = require('util');

var db = anyDb.createConnection(config.get('jscube.db.url'));
module.exports.db = db;

if (config.has('jscube.debug.sqlite')) {
  require('sqlite3').verbose();
  db.on('open', () => {
    db._db.on('trace', (q) => util.log(q));
  });
}

function insertTestData(callback) {
  async.series([
    (cb) => db.query(
      'INSERT INTO runs (runId) VALUES ("development")', cb),
    (cb) => {
      async.times(10, (i, cb) => {
        var teamId = 'testerteam' + i;
        db.query(
          'INSERT INTO teams (teamId, runId) ' +
            'VALUES (?, "development")',
          [teamId],
          cb);
      }, cb);
    }], callback);
}

function init(callback) {
  async.series([
    (cb) => db.query(
      'PRAGMA foreign_keys = ON', cb),
    (cb) => db.query(
      'CREATE TABLE IF NOT EXISTS runs (' +
        'runId VARCHAR(20), ' +
        'startTimestamp DATETIME DEFAULT NULL, ' +
        'PRIMARY KEY(runId ASC))', cb),
    (cb) => db.query(
      'CREATE TABLE IF NOT EXISTS teams (' +
        'teamId VARCHAR(20), ' +
        'runId VARCHAR(20), ' +
        'PRIMARY KEY(teamId ASC), ' +
        'FOREIGN KEY(runId) REFERENCES runs(runId) ON DELETE CASCADE)', cb),
    (cb) => db.query(
      'CREATE TABLE IF NOT EXISTS team_properties (' +
        'teamId VARCHAR(20), ' +
        'propertyKey VARCHAR(20), ' +
        'propertyValue BLOB, ' +
        'PRIMARY KEY(teamId, propertyKey), ' +
        'FOREIGN KEY(teamId) REFERENCES teams(teamId) ON DELETE CASCADE)', cb),
    (cb) => db.query(
      'CREATE TABLE IF NOT EXISTS puzzles (' +
        'puzzleId VARCHAR(40), ' +
        'PRIMARY KEY(puzzleId ASC))', cb),
    (cb) => db.query(
      'CREATE TABLE IF NOT EXISTS submissions (' +
        'submissionId INTEGER, ' +
        'puzzleId VARCHAR(40), ' +
        'teamId VARCHAR(20), ' +
        'submission TEXT, ' +
        'timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, ' +
        'status VARCHAR(10) DEFAULT "' + status.Submission.DEFAULT.key + '", ' +
        'PRIMARY KEY(submissionId ASC), ' +
        'FOREIGN KEY(teamId) REFERENCES teams(teamId) ON DELETE CASCADE, ' +
        'FOREIGN KEY(puzzleId) REFERENCES puzzles(puzzleId) ON DELETE CASCADE)', cb),
    (cb) => db.query(
      'CREATE TABLE IF NOT EXISTS visibilities (' +
        'teamId VARCHAR(20), ' +
        'puzzleId VARCHAR(20), ' +
        'status VARCHAR(10) DEFAULT "' + status.Visibility.DEFAULT.key + '", ' +
        'PRIMARY KEY(teamId, puzzleId), ' +
        'FOREIGN KEY(teamId) REFERENCES teams(teamId) ON DELETE CASCADE, ' +
        'FOREIGN KEY(puzzleId) REFERENCES puzzles(puzzleId) ON DELETE CASCADE)', cb),
    (cb) => db.query(
      'CREATE TABLE IF NOT EXISTS visibility_history (' +
        'visibilityHistoryId INTEGER, ' +
        'teamId VARCHAR(20), ' +
        'puzzleId VARCHAR(20), ' +
        'status VARCHAR(10) DEFAULT "' + status.Visibility.DEFAULT.key + '", ' +
        'timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, ' +
        'PRIMARY KEY(visibilityHistoryId ASC), ' +
        'FOREIGN KEY(teamId) REFERENCES teams(teamId) ON DELETE CASCADE, ' +
        'FOREIGN KEY(puzzleId) REFERENCES puzzles(puzzleId) ON DELETE CASCADE)', cb),
    insertTestData
  ], callback);
}
module.exports.init = init;

function reset(callback) {
  var tables = [
    'runs',
    'teams',
    'team_properties',
    // Don't clear puzzles, it's populated once on startup by the hunt module.
    'submissions',
    'visibilities',
    'visibility_history',
  ];
  async.series([
    (cb) => {
      async.each(tables, (table, cb) => {
        db.query('DELETE FROM ' + table, cb);
      }, cb);
    },
    insertTestData
  ], callback);
}
module.exports.reset = reset;
