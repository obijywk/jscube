var config = require('config');

module.exports.Submission = {
  'SUBMITTED': 'SUBMITTED',
  'ASSIGNED': 'ASSIGNED',
  'INCORRECT': 'INCORRECT',
  'CORRECT': 'CORRECT',
};
module.exports.SUBMISSION_DEFAULT = module.exports.Submission.SUBMITTED;

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
    return visibility == module.exports.Visibility.UNLOCKED;
  }
}
