var config = require('config');
var express = require('express');
var morgan = require('morgan');

var app = express();
app.use(morgan('short'));
app.use('/teams', require('./routes/teams'));

app.listen(config.get('jscube.port'));
