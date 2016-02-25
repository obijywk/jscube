var assert = require('chai').assert;
var async = require('async');
var db = require('../db/db');
var dbVisibility = require('../db/visibility');
var errorUtil = require('../util/error');
var eventEmitter = require('../events/emitter');
var sinon = require('sinon');
var status = require('../util/status');

describe('DB visibility', function() {
  before(db.reset);

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
      errorUtil.thrower(err);
      assert.equal(visibility, status.Visibility.DEFAULT);
      done();
    });
  });

  it('update causes write and event', function(done) {
    eventVerifier.once().withArgs({
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
    ], (err) => {
      errorUtil.thrower(err);
      done();
    });
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
    ], (err) => {
      errorUtil.thrower(err);
      done();
    });
  });
});
