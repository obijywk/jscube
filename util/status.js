var _ = require('underscore');
var config = require('config');

module.exports.Submission = {
  'SUBMITTED': 'SUBMITTED',
  'ASSIGNED': 'ASSIGNED',
  'INCORRECT': 'INCORRECT',
  'CORRECT': 'CORRECT',
};
module.exports.SUBMISSION_DEFAULT = module.exports.Submission.SUBMITTED;
module.exports.submissionIsTerminal = (submission) => {
  return _.contains(['INCORRECT', 'CORRECT'], submission);
}

if (config.has('jscube.hunt.visibilityStatusSet')) {
  // TODO: load visibility status set based on config
} else {
  module.exports.Visibility = {
    'INVISIBLE': 'INVISIBLE',
    'VISIBLE': 'VISIBLE',
    'UNLOCKED': 'UNLOCKED',
    'SOLVED': 'SOLVED',
  };
  module.exports.VISIBILITY_DEFAULT = module.exports.Visibility.INVISIBLE;
  module.exports.visibilityAllowSubmission = (visibility) => {
    return _.contains(['UNLOCKED'], visibility);
  }
  module.exports.visibilityAllowedAntecedents = (visibility) => {
    switch (visibility) {
    case 'INVISIBLE':
      return [];
    case 'VISIBLE':
      return ['INVISIBLE'];
    case 'UNLOCKED':
      return ['INVISIBLE', 'VISIBLE'];
    case 'SOLVED':
      return ['UNLOCKED'];
    }
  }
}
