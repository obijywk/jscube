var eventEmitter = require('../events/emitter');
var express = require('express');

var router = express.Router();

router.post('/', (req, res) => {
  eventEmitter.emit(req.body.eventType, req.body);
  res.json(req.body);
});

module.exports = router;
