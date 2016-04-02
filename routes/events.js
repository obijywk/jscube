var _ = require('underscore');
var async = require('async');
var dbPuzzles = require('../db/puzzles');
var eventEmitter = require('../events/emitter');
var express = require('express');

var router = express.Router();

router.post('/', (req, res) => {
  var validators = [];

  switch (req.body.eventType) {
  case 'FullRelease':
    validators.push(cb => dbPuzzles.exists(req.body.puzzleId, cb));
    break;
  }

  async.parallel(validators, (err, results) => {
    if (err) {
      return res.status(400).send(err.message);
    }
    if (_.every(results)) {
      eventEmitter.emit(req.body.eventType, req.body);
      res.json(req.body);
    } else {
      return res.status(400).send('invalid event');
    }
  });
});

module.exports = router;
