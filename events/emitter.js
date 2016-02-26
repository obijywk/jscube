'use strict';

var EventEmitter = require('events');
var log = require('bristol');

class HuntEventEmitter extends EventEmitter {
  emit(eventType, arg) {
    log.trace('Event', arg);
    super.emit(eventType, arg);
  }
}

module.exports = new HuntEventEmitter();

