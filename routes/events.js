var _ = require('underscore');
var eventEmitter = require('../events/emitter');
var express = require('express');

var router = express.Router();

router.post('/', (req, res) => {
  eventEmitter.emit(req.body.eventType, req.body);
  res.json(_.omit(req.body, 'eventType'));
});

module.exports = router;
