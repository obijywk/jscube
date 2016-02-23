var _ = require('underscore');
var db = require('../db/db');
var dbPuzzles = require('../db/puzzles');
var dbTeams = require('../db/teams');
var dbVisibility = require('../db/visibility');
var eventEmitter = require('../events/emitter');
var moment = require('moment');
var status = require('../util/status');

dbPuzzles.create([
  'dog_show',
  'you_complete_me',
  'rip_van_winkle',
  'crimes_against_cruciverbalism',
  'dreamtime',
  'dreamtime_day_one',
  'dreamtime_day_two',
  'dreamtime_day_three',
]);

eventEmitter.on('HuntStart', (params) => {
  dbTeams.forEachTeamId(params.runId, (teamId) => {
    dbVisibility.update(
      teamId,
      'dog_show',
      status.Visibility.UNLOCKED,
      (err) => {
        if (err) {
          throw err;
        }
      });
  });
});

var CASCADING_UNLOCKS = {
  'dog_show': ['you_complete_me'],
  'rip_van_winkle': ['crimes_against_cruciverbalism'],
  'dreamtime': ['dreamtime_day_one'],
};

var SOLVE_UNLOCK = {
  'dog_show': 'rip_van_winkle',
};

eventEmitter.on('VisibilityChange', (visibility) => {
  var puzzleIdsToUnlock = [];
  switch (visibility.status) {
  case status.Visibility.UNLOCKED:
    puzzleIdsToUnlock = CASCADING_UNLOCKS[visibility.puzzleId];
    break;
  case status.Visibility.SOLVED:
    puzzleIdsToUnlock = [SOLVE_UNLOCK[visibility.puzzleId]];
    break;
  }
  _.each(puzzleIdsToUnlock, (puzzleIdToUnlock) => {
    dbVisibility.update(
      visibility.teamId,
      puzzleIdToUnlock,
      status.Visibility.UNLOCKED,
      (err) => {
        if (err) {
          throw err;
        }
      });
  });
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
      dbTeams.forEachTeamId(runId, (teamId) => {
        dbVisibility.update(
          teamId,
          timedUnlock.puzzleId,
          status.Visibility.UNLOCKED,
          (err) => {
            if (err) {
              throw err;
            }
          });
      });
    }
  });
}

setInterval(() => {
  // TODO: don't keep processing all old runs forever
  db.all(
    'SELECT runId, startTimestamp FROM runs',
    (err, rows) => {
      if (err) {
        return console.log('Failed to read run start timestamps: ' + err);
      }
      _.each(rows, (row) => {
        if (!row.startTimestamp) {
          return;
        }
        processTimedUnlocks(row.runId, row.startTimestamp);
      });
    });
}, 60000);
