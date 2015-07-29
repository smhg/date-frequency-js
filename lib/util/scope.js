'use strict';

var indexof = require('lodash.indexof');

var scopes = {
  'Y': ['E'],
  'M': ['Y', 'E'],
  'W': ['Y', 'M', 'E'],
  'D': ['M', 'Y', 'W', 'E'],
  'h': ['D', 'W', 'M', 'Y', 'E'],
  'm': ['h', 'D', 'W', 'M', 'Y', 'E'],
  's': ['m', 'h', 'D', 'W', 'M', 'Y', 'E']
};

var getDefault = function (unit) {
  if (!(unit in scopes)) {
    throw new Error('Invalid unit');
  }

  return scopes[unit][0];
};

module.exports = {
  filter: function (unit, scope) {
    if (!(unit in scopes)) {
      throw new Error('Invalid unit');
    }

    if (indexof(scopes[unit], scope) < 0) {
      return getDefault(unit);
    }

    return scope;
  },
  getDefault: getDefault
};
