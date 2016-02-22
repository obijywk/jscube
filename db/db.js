var sqlite3 = require('sqlite3').verbose();
var status = require('../util/status');

var db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run('PRAGMA foreign_keys = ON');
  db.run(
    'CREATE TABLE IF NOT EXISTS runs (' +
      'runId VARCHAR(20), ' +
      'startTimestamp DATETIME DEFAULT NULL, ' +
      'PRIMARY KEY(runId ASC))');
  db.run(
    'CREATE TABLE IF NOT EXISTS teams (' +
      'teamId VARCHAR(20), ' +
      'runId VARCHAR(20), ' +
      'PRIMARY KEY(teamId ASC), ' +
      'FOREIGN KEY(runId) REFERENCES runs(runId))');
  db.run(
    'CREATE TABLE IF NOT EXISTS team_properties (' +
      'teamId VARCHAR(20), ' +
      'propertyKey VARCHAR(20), ' +
      'propertyValue BLOB, ' +
      'PRIMARY KEY(teamId, propertyKey), ' +
      'FOREIGN KEY(teamId) REFERENCES teams(teamId))');
  db.run(
    'CREATE TABLE IF NOT EXISTS puzzles (' +
      'puzzleId VARCHAR(40), ' +
      'PRIMARY KEY(puzzleId ASC))');
  db.run(
    'CREATE TABLE IF NOT EXISTS submissions (' +
      'submissionId INTEGER, ' +
      'puzzleId VARCHAR(40), ' +
      'teamId VARCHAR(20), ' +
      'submission TEXT, ' +
      'timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, ' +
      'status VARCHAR(10) DEFAULT "' + status.SubmissionStatus.getDefault().value + '", ' +
      'PRIMARY KEY(submissionId ASC), ' +
      'FOREIGN KEY(teamId) REFERENCES teams(teamId), ' +
      'FOREIGN KEY(puzzleId) REFERENCES puzzles(puzzleId))');
  db.run(
    'CREATE TABLE IF NOT EXISTS visibilities (' +
      'teamId VARCHAR(20), ' +
      'puzzleId VARCHAR(20), ' +
      'status VARCHAR(10) DEFAULT "' + status.VisibilityStatus.getDefault().value + '", ' +
      'PRIMARY KEY(teamId, puzzleId), ' +
      'FOREIGN KEY(teamId) REFERENCES teams(teamId), ' +
      'FOREIGN KEY(puzzleId) REFERENCES puzzles(puzzleId))');
  db.run(
    'CREATE TABLE IF NOT EXISTS visibility_history (' +
      'visibilityHistoryId INTEGER, ' +
      'teamId VARCHAR(20), ' +
      'puzzleId VARCHAR(20), ' +
      'status VARCHAR(10) DEFAULT "' + status.VisibilityStatus.getDefault().value + '", ' +
      'timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, ' +
      'PRIMARY KEY(visibilityHistoryId ASC), ' +
      'FOREIGN KEY(teamId) REFERENCES teams(teamId), ' +
      'FOREIGN KEY(puzzleId) REFERENCES puzzles(puzzleId))');

  // Insert some test data.

  db.run('INSERT INTO runs (runId) VALUES ("development")');

  var insertPuzzle = db.prepare(
    'INSERT INTO puzzles (puzzleId) VALUES (?)');
  for (var i = 0; i < 10; i++) {
    insertPuzzle.run('puzzle' + i );
  }
  insertPuzzle.finalize();

  var insertTeam = db.prepare(
    'INSERT INTO teams (teamId, runId) ' +
      'VALUES (?, "development")');
  var insertVisibility = db.prepare(
    'INSERT INTO visibilities (teamId, puzzleId, status) VALUES (?, "puzzle0", "UNLOCKED")');
  for (var i = 0; i < 10; i++) {
    var teamId = 'testerteam' + i;
    insertTeam.run(teamId);
    insertVisibility.run(teamId);
  }
  insertTeam.finalize();
  insertVisibility.finalize();
});

module.exports = db;
