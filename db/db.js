var sqlite3 = require('sqlite3').verbose();

var db = new sqlite3.Database(':memory:');

db.serialize(() => {
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

  // Insert some test data.
  var insertTeam = db.prepare(
    'INSERT INTO teams (teamId, runId) ' +
      'VALUES (?, "development")');
  var insertPhoneProperty = db.prepare(
    'INSERT INTO team_properties (teamId, propertyKey, propertyValue) ' +
      'VALUES (?, "phone", ?)');
  for (var i = 0; i < 10; i++) {
    insertTeam.run('testerteam' + i);
    insertPhoneProperty.run(
      'testerteam' + i,
      JSON.stringify(['555-1212']));
  }
  insertTeam.finalize();
  insertPhoneProperty.finalize();
});

module.exports = db;
