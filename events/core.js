var db = require('../db/db');
var eventEmitter = require('./emitter');

eventEmitter.on('HuntStart', (params) => {
  db.run(
    'UPDATE runs SET startTimestamp = ? ' +
      'WHERE runId = ? AND startTimestamp IS NULL',
    [Date.now(), params.runId],
    function(err) {
      if (this.changes == 0) {
        console.log('HuntStart did not cause an update');
      }
    });
});
