var _ = require('underscore');
var db = require('../db/db').db;
var dbPuzzles = require('../db/puzzles');
var dbTeams = require('../db/teams');
var dbVisibility = require('../db/visibility');
var errorUtil = require('../util/error');
var eventEmitter = require('../events/emitter');
var moment = require('moment');
var status = require('../util/status');
var unlock = require('../util/unlock');

function init(callback) {
  dbPuzzles.create([
    'dog_show',
    'you_complete_me',
    'rip_van_winkle',
    'crimes_against_cruciverbalism',
    'dreamtime',
    'dreamtime_day_one',
    'dreamtime_day_two',
    'dreamtime_day_three',
  ], callback);
}
module.exports.init = init;

eventEmitter.on('HuntStart', (params) => {
  unlock.forAllTeams(params.runId, 'dog_show');
});

unlock.onUnlock({
  'dog_show': ['you_complete_me'],
  'rip_van_winkle': ['crimes_against_cruciverbalism'],
  'dreamtime': ['dreamtime_day_one'],
});

unlock.onSolve({
  'dog_show': ['rip_van_winkle'],
});

// All times are offsets from the hunt start time.
var TIMED_UNLOCKS = [
  {
    'timeOffset': moment.duration({minutes: 2}),
    'puzzleId': 'dreamtime',
  },
  {
    'timeOffset': moment.duration({minutes: 4}),
    'puzzleId': 'dreamtime_day_two',
  },
  {
    'timeOffset': moment.duration({minutes: 6}),
    'puzzleId': 'dreamtime_day_three',
  },
];

function processTimedUnlocks(runId, startTimestamp) {
  var start = moment(startTimestamp);
  var now = moment();
  _.each(TIMED_UNLOCKS, (timedUnlock) => {
    if (now.isAfter(moment(start).add(timedUnlock.timeOffset))) {
      unlock.forAllTeams(runId, timedUnlock.puzzleId);
    }
  });
}

setInterval(() => {
  // TODO: don't keep processing all old runs forever
  db.query(
    'SELECT runId, startTimestamp FROM runs',
    (err, result) => {
      errorUtil.thrower(err);
      _.each(result.rows, (row) => {
        if (!row.startTimestamp) {
          return;
        }
        processTimedUnlocks(row.runId, row.startTimestamp);
      });
    });
}, 60000);
