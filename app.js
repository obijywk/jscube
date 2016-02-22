var config = require('config');
var express = require('express');

var app = express();

app.get('/', (req, res) => {
  res.send('Hello world');
});

app.listen(config.get('jscube.port'));
