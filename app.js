var _ = require('underscore');
var bodyParser = require('body-parser');
var config = require('config');
var express = require('express');
var morgan = require('morgan');

var app = express();
app.use(morgan(
  ':date[iso] :remote-addr :remote-user :method :url :status :res[content-length] - :response-time ms'));
app.use(bodyParser.json());
app.use('/events', require('./routes/events'));
app.use('/submissions', require('./routes/submissions'));
app.use('/teams', require('./routes/teams'));

_.each(config.get('jscube.eventHandlers'), (handler) => {
  require(handler);
});

app.listen(config.get('jscube.port'));
