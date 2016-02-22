var _ = require('underscore');
var async = require('async');
var db = require('../db/db');
var express = require('express');

var router = express.Router();

router.get('/:id', (req, res) => {
  async.parallel([
    (cb) => {
      db.get(
        'SELECT teamId, runId FROM teams WHERE teamId = ?',
        [req.params.id], cb);
    },
    (cb) => {
      db.all(
        'SELECT propertyKey, propertyValue FROM team_properties WHERE teamId = ?',
        [req.params.id], cb);
    }], (err, results) => {
      if (err) {
        return res.status(500).send(err);
      }
      var resource = results[0];
      if (resource === undefined) {
        return res.status(404).send('Team not found');
      }
      _.each(results[1], (row) => {
        resource[row.propertyKey] = JSON.parse(row.propertyValue);
      });
      res.json(resource);
    });
});

module.exports = router;
