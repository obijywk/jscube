var dbVisibility = require('../db/visibility');
var errorUtil = require('../util/error');

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
