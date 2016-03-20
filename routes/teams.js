var _ = require('underscore');
var async = require('async');
var db = require('../db/db').db;
var express = require('express');

var router = express.Router();

router.get('/', (req, res) => {
  db.query('SELECT * FROM teams', (err, result) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    res.json({
      'teams': result.rows,
    });
  });
});

router.get('/:id', (req, res) => {
  async.parallel([
    (cb) => {
      db.query(
        'SELECT teamId, runId FROM teams WHERE teamId = ?',
        [req.params.id],
        cb);
    },
    (cb) => {
      db.query(
        'SELECT propertyKey, propertyValue FROM team_properties WHERE teamId = ?',
        [req.params.id],
        cb);
    }], (err, results) => {
      if (err) {
        return res.status(500).send(err.message);
      }
      var resourceResult = results[0];
      if (resourceResult.rowCount == 0) {
        return res.status(404).send('Team not found');
      }
      var resource = resourceResult.rows[0];
      _.each(results[1].rows, (row) => {
        resource[row.propertyKey] = row.propertyValue;
      });
      res.json(resource);
    });
});

module.exports = router;
