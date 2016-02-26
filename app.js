var _ = require('underscore');
var async = require('async');
var bodyParser = require('body-parser');
var config = require('config');
var db = require('./db/db');
var errorUtil = require('./util/error');
var express = require('express');
var log = require('bristol');

if (config.has('jscube.logging.console') &&
    config.get('jscube.logging.console')) {
  log.addTarget('console').withFormatter('human');
}

var app = express();

app.use((req, res, next) => {
  log.info('Request', {
    ip: req.ip,
    method: req.method,
    url: req.originalUrl || req.url,
    status: res.statusCode,
  });
  next();
});

app.use(bodyParser.json());

app.use('/events', require('./routes/events'));
app.use('/submissions', require('./routes/submissions'));
app.use('/teams', require('./routes/teams'));
app.use('/visibilities', require('./routes/visibilities'));

if (require.main === module) {
  var port = config.get('jscube.port');
  async.series([
    db.init,
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
      log.info('Listening', {port: port});
      cb(null);
    }], errorUtil.thrower);
}

// Exported for tests.
module.exports.app = app;
