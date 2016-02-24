var appModule = require('../app');
var app = appModule.app;
var assert = require('chai').assert;
var db = require('../db/db');
var request = require('supertest');
var testUtil = require('./util');

before(testUtil.awaitInitialized(appModule));
before(db.reset);

describe('GET /submissions', function() {
  it('respond with empty list', function(done) {
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
});
