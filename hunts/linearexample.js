var dbPuzzles = require('../db/puzzles');
var dbTeams = require('../db/teams');
var dbVisibility = require('../db/visibility');
var errorUtil = require('../util/error');
var eventEmitter = require('../events/emitter');
var status = require('../util/status');
var unlock = require('../util/unlock');

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
  unlock.forAllTeams(params.runId, 'puzzle1');
});

unlock.onSolve({
  'puzzle1': ['puzzle2'],
  'puzzle2': ['puzzle3'],
  'puzzle3': ['puzzle4'],
  'puzzle4': ['puzzle5'],
  'puzzle5': ['puzzle6'],
  'puzzle6': ['puzzle7'],
});
