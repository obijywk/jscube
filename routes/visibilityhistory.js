var dbVisibility = require('../db/visibility');
var express = require('express');
var status = require('../util/status');

var router = express.Router();

router.get('/', (req, res) => {
  var teamId = null;
  if (req.query.teamId) {
    teamId = req.query.teamId;
  }
  var puzzleId = null;
  if (req.query.puzzleId) {
    puzzleId = req.query.puzzleId;
  }
  var queryStatus = null;
  if (req.query.status) {
    queryStatus = status.Visibility.get(req.query.status);
    if (queryStatus === undefined) {
      return res.status(400).send('Unknown visibility status ' + req.query.status);
    }
  }
  dbVisibility.listHistory(teamId, puzzleId, queryStatus, (err, visibilityChanges) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    res.json({
      'visibilityChanges': visibilityChanges,
    });
  });
});

module.exports = router;
