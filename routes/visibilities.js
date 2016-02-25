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
  dbVisibility.list(teamId, puzzleId, (err, visibilities) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    res.json({
      'visibilities': visibilities,
    });
  });
});

router.get('/:teamId/:puzzleId', (req, res) => {
  dbVisibility.get(
    req.params.teamId,
    req.params.puzzleId,
    (err, visibility) => {
      if (err) {
        return res.status(500).send(err.message);
      }
      res.json({
        'teamId': req.params.teamId,
        'puzzleId': req.params.puzzleId,
        'status': visibility.key,
      });
    });
});

router.post('/:teamId/:puzzleId', (req, res) => {
  var visibilityStatus = status.Visibility.get(req.body.status);
  if (visibilityStatus === undefined) {
    return res.status(400).send('Unknown visibility status ' + req.body.status);
  }
  dbVisibility.update(
    req.params.teamId,
    req.params.puzzleId,
    visibilityStatus,
    (err, updated) => {
      if (err) {
        return res.status(400).send(err.message);
      }
      res.json({'updated': updated});
    });
});

module.exports = router;
