var config = require('config');
var express = require('express');

var app = express();
app.use('/teams', require('./routes/teams'));

app.listen(config.get('jscube.port'));
