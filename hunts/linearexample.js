var dbPuzzles = require('../db/puzzles');
var dbTeams = require('../db/teams');
var dbVisibility = require('../db/visibility');
var eventEmitter = require('../events/emitter');
var status = require('../util/status');

dbPuzzles.create([
  'puzzle1',
  'puzzle2',
  'puzzle3',
  'puzzle4',
  'puzzle5',
  'puzzle6',
  'puzzle7',
]);

eventEmitter.on('HuntStart', (params) => {
  dbTeams.forEachTeamId(params.runId, (teamId) => {
    dbVisibility.update(
      teamId,
      'puzzle1',
      status.Visibility.UNLOCKED,
      (err) => {
        if (err) {
          throw err;
        }
      });
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

eventEmitter.on('SubmissionComplete', (submission) => {
  if (submission.status != status.Submission.CORRECT) {
    return;
  }
  var puzzleIdToUnlock = SOLVE_UNLOCK[submission.puzzleId];
  if (!puzzleIdToUnlock) {
    return;
  }
  dbVisibility.update(
    submission.teamId,
    puzzleIdToUnlock,
    status.Visibility.UNLOCKED,
    (err) => {
      if (err) {
        throw err;
      }
    });
});
