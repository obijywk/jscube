var EventEmitter = require('events');
var util = require('util');

function HuntEventEmitter() {
  EventEmitter.call(this);
}
util.inherits(HuntEventEmitter, EventEmitter);

var emitter = new HuntEventEmitter();

module.exports = emitter;
