var assert = require('chai').assert;
var async = require('async');
var db = require('../db/db');
var dbVisibility = require('../db/visibility');
var eventEmitter = require('../events/emitter');
var linearexample = require('../hunts/linearexample');
var sinon = require('sinon');
var status = require('../util/status');

describe('DB visibility', function() {
  before(db.init);
  before(linearexample.init);
  after(db.clear);

  var eventVerifier;
  beforeEach(function() {
    eventVerifier = sinon.mock();
    eventEmitter.on('VisibilityChange', eventVerifier);
  });
  afterEach(function() {
    eventVerifier.verify();
    eventEmitter.removeListener('VisibilityChange', eventVerifier);
  });

  it('is initially default', function(done) {
    eventVerifier.never();
    dbVisibility.get('testerteam1', 'puzzle1', (err, visibility) => {
      if (err) return done(err);
      assert.equal(visibility, status.Visibility.DEFAULT);
      done();
    });
  });

  it('update causes write and event', function(done) {
    eventVerifier.once().withArgs({
      eventType: 'VisibilityChange',
      teamId: 'testerteam1',
      puzzleId: 'puzzle1',
      status: status.Visibility.UNLOCKED,
    });
    async.waterfall([
      (cb) => {
        dbVisibility.update(
          'testerteam1',
          'puzzle1',
          status.Visibility.UNLOCKED,
          cb);
      },
      (changed, cb) => {
        assert.isTrue(changed);
        dbVisibility.get('testerteam1', 'puzzle1', cb);
      },
      (visibility, cb) => {
        assert.equal(visibility, status.Visibility.UNLOCKED);
        cb(null);
      },
    ], done);
  });

  it('no-change update', function(done) {
    eventVerifier.never();
    async.waterfall([
      (cb) => {
        dbVisibility.update(
          'testerteam1',
          'puzzle1',
          status.Visibility.UNLOCKED,
          cb);
      },
      (changed, cb) => {
        assert.isFalse(changed);
        dbVisibility.get('testerteam1', 'puzzle1', cb);
      },
      (visibility, cb) => {
        assert.equal(visibility, status.Visibility.UNLOCKED);
        cb(null);
      },
    ], done);
  });

  it('list with no parameters', function(done) {
    eventVerifier.never();
    dbVisibility.list(null, null, (err, visibilities) => {
      if (err) return done(err);
      assert.deepEqual(visibilities, [
        {
          teamId: 'testerteam1',
          puzzleId: 'puzzle1',
          status: status.Visibility.UNLOCKED,
        },
      ]);
      done();
    });
  });

  it('list with parameters and no results', function(done) {
    eventVerifier.never();
    dbVisibility.list('testerteam2', null, (err, visibilities) => {
      if (err) return done(err);
      assert.deepEqual(visibilities, []);
      done();
    });
  });
});
