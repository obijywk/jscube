var app = require('../app').app;
var assert = require('chai').assert;
var request = require('supertest');

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
