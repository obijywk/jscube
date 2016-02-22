var dbPuzzles = require('../db/puzzles');
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
  dbVisibility.updateForAllTeams(
    params.runId,
    'puzzle1',
    new status.VisibilityStatus('UNLOCKED'),
    (err) => {
      if (err) {
        console.log('LinearExample puzzle1 unlock failed: ' + err);
      }
    });
});

var nextPuzzle = {
  'puzzle1': 'puzzle2',
  'puzzle2': 'puzzle3',
  'puzzle3': 'puzzle4',
  'puzzle4': 'puzzle5',
  'puzzle5': 'puzzle6',
  'puzzle6': 'puzzle7',
};

eventEmitter.on('SubmissionComplete', (submission) => {
  if (submission.status != 'CORRECT') {
    return;
  }
  var puzzleIdToUnlock = nextPuzzle[submission.puzzleId];
  if (!puzzleIdToUnlock) {
    return;
  }
  dbVisibility.update(
    submission.teamId,
    puzzleIdToUnlock,
    new status.VisibilityStatus('UNLOCKED'),
    (err) => {
      if (err) {
        console.log(
          'LinearExample ' +
            submission.teamId + ' ' + puzzleIdToUnlock +
            ' unlock failed: ' + err);
      }
    });
});
