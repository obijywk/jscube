var _ = require('underscore');
var async = require('async');
var bodyParser = require('body-parser');
var config = require('config');
var db = require('./db/db');
var errorUtil = require('./util/error');
var express = require('express');
var morgan = require('morgan');
var util = require('util');

var app = express();

app.use(morgan(
  ':date[iso] :remote-addr :remote-user :method :url :status :res[content-length] - :response-time ms'));
app.use(bodyParser.json());

app.use('/events', require('./routes/events'));
app.use('/submissions', require('./routes/submissions'));
app.use('/teams', require('./routes/teams'));

var port = config.get('jscube.port');

async.series([
  (cb) => db.init(cb),
  (cb) => {
    async.each(config.get('jscube.huntModules'), (module, cb) => {
      var m = require(module);
      if (m.init) {
        return m.init(cb);
      }
      return cb(null);
    }, cb);
  },
  (cb) => app.listen(port, cb),
  (cb) => {
    util.log('Listening on port ' + port);
    // Exported for tests.
    module.exports.initialized = true;
    cb(null);
  }], errorUtil.thrower);

// Exported for tests.
module.exports.app = app;
