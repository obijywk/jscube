var _ = require('underscore');
var config = require('config');
var Enum = require('enum');

var Submission = new Enum([
  'SUBMITTED',
  'ASSIGNED',
  'INCORRECT',
  'CORRECT',
]);

Submission.SUBMITTED.isTerminal = false;
Submission.ASSIGNED.isTerminal = false;
Submission.INCORRECT.isTerminal = true;
Submission.CORRECT.isTerminal = true;

Submission.DEFAULT = Submission.SUBMITTED;

module.exports.Submission = Submission;

if (config.has('jscube.hunt.visibilityStatusSet')) {
  // TODO: load visibility status set based on config
} else {
  var Visibility = new Enum([
    'INVISIBLE',
    'VISIBLE',
    'UNLOCKED',
    'SOLVED',
  ]);

  Visibility.INVISIBLE.allowSubmission = false;
  Visibility.VISIBLE.allowSubmission = false;
  Visibility.UNLOCKED.allowSubmission = true;
  Visibility.SOLVED.allowSubmission = false;

  Visibility.INVISIBLE.allowedAntecedents = [];
  Visibility.VISIBLE.allowedAntecedents = [
    Visibility.INVISIBLE,
  ];
  Visibility.UNLOCKED.allowedAntecedents = [
    Visibility.INVISIBLE,
    Visibility.VISIBLE,
  ];
  Visibility.SOLVED.allowedAntecedents = [
    Visibility.UNLOCKED,
  ];

  Visibility.DEFAULT = Visibility.INVISIBLE;

  module.exports.Visibility = Visibility;
}
