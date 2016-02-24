var _ = require('underscore');
var dbTeams = require('../db/teams');
var dbVisibility = require('../db/visibility');
var eventEmitter = require('../events/emitter');
var sinon = require('sinon');
var status = require('../util/status');
var unlock = require('../util/unlock');

describe('unlock', function() {
  var sandbox;
  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });
  afterEach(function() {
    sandbox.restore();
  });
  describe('#forAllTeams()', function() {
    it('updates puzzle visibility for all teams', function() {
      var teamIds = ['team1', 'team2', 'team3'];
      sandbox.stub(dbTeams, 'forEachTeamId', function(runId, cb) {
        _.each(teamIds, cb);
      });
      var mockDbVisibility = sandbox.mock(dbVisibility);
      _.each(teamIds, function(teamId) {
        mockDbVisibility.expects('update').once()
          .withArgs(teamId, 'puzzleId', status.Visibility.UNLOCKED)
          .callsArgWith(3, null);
      });
      unlock.forAllTeams('runId', 'puzzleId');
      mockDbVisibility.verify();
    });
  });
  describe('#onSolve()', function() {
    it('updates puzzle visibility', function() {
      var handler;
      sandbox.stub(eventEmitter, 'on', function(event, fn) {
        handler = fn;
      });
      unlock.onSolve({
        'puzzle1': ['puzzle2', 'puzzle3'],
        'puzzle3': ['puzzle4'],
      });
      var mockDbVisibility = sandbox.mock(dbVisibility);
      _.each(['puzzle2', 'puzzle3'], function(puzzleId) {
        mockDbVisibility.expects('update').once()
          .withArgs('teamId', puzzleId, status.Visibility.UNLOCKED)
          .callsArgWith(3, null);
      });
      // Ensure that an 'UNLOCKED' event doesn't cause any unlocks.
      handler({
        status: status.Visibility.UNLOCKED,
        puzzleId: 'puzzle1',
        teamId: 'teamId',
      });
      handler({
        status: status.Visibility.SOLVED,
        puzzleId: 'puzzle1',
        teamId: 'teamId',
      });
      mockDbVisibility.verify();
    });
  });
});
