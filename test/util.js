var dbVisibility = require('../db/visibility');
var errorUtil = require('../util/error');

function awaitInitialized(module) {
  return function(done) {
    var checker = setInterval(() => {
      if (module.initialized) {
        clearInterval(checker);
        done();
      }
    }, 1);
  }
}
module.exports.awaitInitialized = awaitInitialized;

function awaitVisibility(teamId, puzzleId, visibility, cb) {
  return function() {
    var checkRunning = false;
    var checker = setInterval(() => {
      if (checkRunning) {
        return;
      }
      checkRunning = true;
      dbVisibility.get(teamId, puzzleId, (err, storedVisibility) => {
        checkRunning = false;
        errorUtil.thrower(err);
        if (storedVisibility == visibility) {
          clearInterval(checker);
          cb();
        }
      });
    }, 1);
  }
}
module.exports.awaitVisibility = awaitVisibility;
