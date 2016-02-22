var db = require('../db/db');
var express = require('express');

var router = express.Router();

router.get('/:id', (req, res) => {
  db.get(
    'SELECT teamId, runId FROM teams WHERE teamId = ?',
    [req.params.id],
    (err, row) => {
      if (err) {
        return res.status(500).send(err);
      }
      if (row === undefined) {
        return res.status(404).send();
      }
      res.json(row);
    });
});

module.exports = router;
