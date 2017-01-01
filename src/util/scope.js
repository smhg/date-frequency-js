'use strict';

const scopes = {
  'Y': ['E'],
  'M': ['Y', 'E'],
  'W': ['Y', 'M', 'E'],
  'D': ['M', 'Y', 'W', 'E'],
  'h': ['D', 'W', 'M', 'Y', 'E'],
  'm': ['h', 'D', 'W', 'M', 'Y', 'E'],
  's': ['m', 'h', 'D', 'W', 'M', 'Y', 'E']
};

const getDefault = function (unit) {
  if (!(unit in scopes)) {
    throw new Error('Invalid unit');
  }

  return scopes[unit][0];
};

export default {
  filter: function (unit, scope) {
    if (!(unit in scopes)) {
      throw new Error('Invalid unit');
    }

    if (scopes[unit].indexOf(scope) === -1) {
      return getDefault(unit);
    }

    return scope;
  },
  getDefault: getDefault
};
