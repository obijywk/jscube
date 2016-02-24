/**
 * Unlock utility module.
 * @module util/unlock
 */

var _ = require('underscore');
var dbTeams = require('../db/teams');
var dbVisibility = require('../db/visibility');
var errorUtil = require('./error');
var eventEmitter = require('../events/emitter');
var status = require('./status');

/**
 * Unconditionally unlock the given puzzle for all teams in this run.
 * @param {string} runId - the id of this run of the hunt
 * @param {string} puzzleId - the id of the puzzle to unlock
 * @alias module:util/unlock.forAllTeams
 */
function forAllTeams(runId, puzzleId) {
  dbTeams.forEachTeamId(runId, (teamId) => {
    dbVisibility.update(
      teamId,
      puzzleId,
      status.Visibility.UNLOCKED,
      errorUtil.thrower);
  });
}
module.exports.forAllTeams = forAllTeams;

/**
 * Configure a list of puzzles to be unlocked in response to a puzzle visibility
 * change.
 * @param {Object} visibilityStatus - the Visibility enum value that will
 *     trigger the unlocks
 * @param {Object.<string, string[]>} unlocks - a map from a puzzle id to a
 *     list of puzzle ids to be unlocked when the key puzzle's visibility
 *     changes
 * @private
 */
function onVisibilityChange(visibilityStatus, unlocks) {
  eventEmitter.on('VisibilityChange', (visibility) => {
    if (visibility.status != visibilityStatus) {
      return;
    }
    var puzzleIdsToUnlock = unlocks[visibility.puzzleId];
    _.each(puzzleIdsToUnlock, (puzzleIdToUnlock) => {
      dbVisibility.update(
        visibility.teamId,
        puzzleIdToUnlock,
        status.Visibility.UNLOCKED,
        errorUtil.thrower);
    });
  });
}

/**
 * Configure a list of puzzles to be unlocked in response to another puzzle
 * being solved.
 * @param {Object.<string, string[]>} unlocks - a map from a puzzle id to a
 *     list of puzzle ids to be unlocked when the key puzzle is solved
 * @alias module:util/unlock.onSolve
 */
function onSolve(unlocks) {
  onVisibilityChange(status.Visibility.SOLVED, unlocks);
}
module.exports.onSolve = onSolve;

/**
 * Configure a list of puzzles to be unlocked in response to another puzzle
 * being unlocked.
 * @param {Object.<string, string[]>} unlocks - a map from a puzzle id to a
 *     list of puzzle ids to be unlocked when the key puzzle is unlocked
 * @alias module:util/unlock.onUnlock
 */
function onUnlock(unlocks) {
  onVisibilityChange(status.Visibility.UNLOCKED, unlocks);
}
module.exports.onUnlock = onUnlock;
