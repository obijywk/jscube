'use strict';

var EventEmitter = require('events');
var util = require('util');

class HuntEventEmitter extends EventEmitter {
  emit(eventType, arg) {
    util.log('Event: ' + eventType + ': ' + JSON.stringify(arg));
    super.emit(eventType, arg);
  }
}

module.exports = new HuntEventEmitter();

