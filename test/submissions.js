var app = require('../app').app;
var assert = require('chai').assert;
var async = require('async');
var core = require('../events/core');
var db = require('../db/db');
var linearexample = require('../hunts/linearexample');
var request = require('supertest');
var status = require('../util/status');
var testUtil = require('./util');

describe('submissions', function() {
  before(db.init);
  before(linearexample.init);
  after(db.clear);

  it('are initially empty', function(done) {
    request(app)
      .get('/submissions')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        assert.deepEqual(res.body, {submissions: []});
        done();
      });
  });
  it('are rejected for locked puzzles', function(done) {
    request(app)
      .post('/submissions')
      .send({
        teamId: 'testerteam1',
        puzzleId: 'puzzle1',
        submission: 'ANSWER',
      })
      .expect(400, done);
  });
  it('are accepted for unlocked puzzles', function(done) {
    async.series([
      (cb) => {
        request(app)
          .post('/events')
          .send({
            eventType: 'FullRelease',
            puzzleId: 'puzzle1',
            runId: 'development',
          })
          .expect(200, testUtil.awaitVisibility(
            'testerteam1', 'puzzle1', status.Visibility.UNLOCKED, cb));
      },
      (cb) => {
        request(app)
          .post('/submissions')
          .send({
            teamId: 'testerteam1',
            puzzleId: 'puzzle1',
            submission: 'ANSWER',
          })
          .expect(200, cb);
      }], done);
  });
  it('are initially in state SUBMITTED', function(done) {
    request(app)
      .get('/submissions/1')
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        assert.propertyVal(res.body, 'teamId', 'testerteam1');
        assert.propertyVal(res.body, 'puzzleId', 'puzzle1');
        assert.propertyVal(res.body, 'submission', 'ANSWER');
        assert.propertyVal(res.body, 'status', 'SUBMITTED');
        done();
      });
  });
  it('unknown states are rejected', function(done) {
    request(app)
      .post('/submissions/1')
      .send({status: 'UNKNOWN'})
      .expect(400, done);
  });
  it('can be changed to state ASSIGNED', function(done) {
    async.series([
      (cb) => {
        request(app)
          .post('/submissions/1')
          .send({status: 'ASSIGNED'})
          .expect(200, cb);
      },
      (cb) => {
        request(app)
          .get('/submissions/1')
          .expect(200)
          .end(function(err, res) {
            if (err) return done(err);
            assert.propertyVal(res.body, 'status', 'ASSIGNED');
            done();
          });
      }], done);
  });
});
