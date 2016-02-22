var express = require('express');

var router = express.Router();

router.get('/:id', (req, res) => {
  res.json({
    'teamId': req.params.id,
    'runId': 'placeholderRunId',
  });
});

module.exports = router;
