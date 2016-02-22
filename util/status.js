'use strict';
var _ = require('underscore');
var config = require('config');

class SubmissionStatus {
  static validValues() {
    return [
      'SUBMITTED',
      'ASSIGNED',
      'INCORRECT',
      'CORRECT',
    ];
  }

  static getDefault() {
    return new SubmissionStatus('SUBMITTED');
  }

  constructor(value) {
    if (!_.contains(SubmissionStatus.validValues(), value)) {
      throw 'invalid SubmissionStatus value: ' + value;
    }
    this.value = value;
  }

  isTerminal() {
    return _.contains(['INCORRECT', 'CORRECT'], this.value);
  }
}
module.exports.SubmissionStatus = SubmissionStatus;

if (config.has('jscube.hunt.visibilityStatusSet')) {
  // TODO: load visibility status set based on config
} else {
  class VisibilityStatus {
    static validValues() {
      return [
        'INVISIBLE',
        'VISIBLE',
        'UNLOCKED',
        'SOLVED',
      ];
    }

    static getDefault() {
      return new VisibilityStatus('INVISIBLE');
    }

    constructor(value) {
      if (!_.contains(VisibilityStatus.validValues(), value)) {
        throw 'invalid VisibilityStatus value: ' + value;
      }
      this.value = value;
    }

    allowSubmission() {
      return _.contains(['UNLOCKED'], this.value);
    }

    getAllowedAntecedentValues() {
      switch (this.value) {
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
  module.exports.VisibilityStatus = VisibilityStatus;
}
