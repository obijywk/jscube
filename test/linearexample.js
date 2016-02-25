var app = require('../app').app;
var assert = require('chai').assert;
var core = require('../events/core');
var db = require('../db/db');
var linearexample = require('../hunts/linearexample');
var request = require('supertest');
var status = require('../util/status');
var testUtil = require('./util');

describe('LinearExample hunt', function() {
  before(db.init);
  before(linearexample.init);
  after(db.clear);

  it('puzzle1 is locked', function(done) {
    request(app)
      .post('/submissions')
      .send({
        teamId: 'testerteam1',
        puzzleId: 'puzzle1',
        submission: 'ANSWER'
      })
      .expect(400, done);
  });
  it('HuntStart', function(done) {
    var event = {eventType: 'HuntStart', runId: 'development'};
    request(app)
      .post('/events')
      .send(event)
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        assert.deepEqual(res.body, event);
        testUtil.awaitVisibility(
          'testerteam1', 'puzzle1', status.Visibility.UNLOCKED, done)();
      });
  });
  it('submit puzzle1', function(done) {
    request(app)
      .post('/submissions')
      .send({
        teamId: 'testerteam1',
        puzzleId: 'puzzle1',
        submission: 'ANSWER'
      })
      .expect(200, done);
  });
  it('puzzle2 is locked', function(done) {
    request(app)
      .post('/submissions')
      .send({
        teamId: 'testerteam1',
        puzzleId: 'puzzle2',
        submission: 'ANSWER'
      })
      .expect(400, done);
  });
  it('set puzzle1 correct', function(done) {
    request(app)
      .post('/submissions/1')
      .send({
        status: 'CORRECT',
      })
      .expect(200, testUtil.awaitVisibility(
        'testerteam1', 'puzzle2', status.Visibility.UNLOCKED, done));
  });
  it('submit puzzle2', function(done) {
    request(app)
      .post('/submissions')
      .send({
        teamId: 'testerteam1',
        puzzleId: 'puzzle2',
        submission: 'ANSWER'
      })
      .expect(200, done);
  });
});
