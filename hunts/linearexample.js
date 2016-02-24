var dbPuzzles = require('../db/puzzles');
var dbTeams = require('../db/teams');
var dbVisibility = require('../db/visibility');
var errorUtil = require('../util/error');
var eventEmitter = require('../events/emitter');
var status = require('../util/status');

function init(callback) {
  dbPuzzles.create([
    'puzzle1',
    'puzzle2',
    'puzzle3',
    'puzzle4',
    'puzzle5',
    'puzzle6',
    'puzzle7',
  ], callback);
}
module.exports.init = init;

eventEmitter.on('HuntStart', (params) => {
  dbTeams.forEachTeamId(params.runId, (teamId) => {
    dbVisibility.update(
      teamId,
      'puzzle1',
      status.Visibility.UNLOCKED,
      errorUtil.thrower);
  });
});

const SOLVE_UNLOCK = {
  'puzzle1': 'puzzle2',
  'puzzle2': 'puzzle3',
  'puzzle3': 'puzzle4',
  'puzzle4': 'puzzle5',
  'puzzle5': 'puzzle6',
  'puzzle6': 'puzzle7',
};

eventEmitter.on('VisibilityChange', (visibility) => {
  if (visibility.status != status.Visibility.SOLVED) {
    return;
  }
  var puzzleIdToUnlock = SOLVE_UNLOCK[visibility.puzzleId];
  if (!puzzleIdToUnlock) {
    return;
  }
  dbVisibility.update(
    visibility.teamId,
    puzzleIdToUnlock,
    status.Visibility.UNLOCKED,
    errorUtil.thrower);
});
