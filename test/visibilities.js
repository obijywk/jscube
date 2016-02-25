var app = require('../app').app;
var assert = require('chai').assert;
var async = require('async');
var core = require('../events/core');
var db = require('../db/db');
var linearexample = require('../hunts/linearexample');
var request = require('supertest');
var status = require('../util/status');
var testUtil = require('./util');

describe('visibilities', function() {
  before(db.init);
  before(linearexample.init);
  after(db.clear);

  it('are initially empty', function(done) {
    request(app)
      .get('/visibilities')
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        assert.deepEqual(res.body, {visibilities: []});
        done();
      });
  });

  it('can be changed', function(done) {
    async.series([
      (cb) => {
        request(app)
          .post('/visibilities/testerteam1/puzzle1')
          .send({status: 'UNLOCKED'})
          .expect(200, cb);
      },
      (cb) => {
        request(app)
          .get('/visibilities/testerteam1/puzzle1')
          .expect(200)
          .end(function(err, res) {
            if (err) return done(err);
            assert.deepEqual(res.body, {
              teamId: 'testerteam1',
              puzzleId: 'puzzle1',
              status: 'UNLOCKED',
            });
            done();
          });
      }], done);
  });

  it('can be listed', function(done) {
    request(app)
      .get('/visibilities')
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        assert.deepEqual(res.body, {
          visibilities: [
            {
              teamId: 'testerteam1',
              puzzleId: 'puzzle1',
              status: 'UNLOCKED',
            },
          ],
        });
        done();
      });
  });
});
