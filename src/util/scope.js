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

function getDefault (unit) {
  if (!(unit in scopes)) {
    throw Error(`Invalid unit: ${unit}`);
  }

  return scopes[unit][0];
};

export default {
  filter: (unit, scope) => {
    if (!(unit in scopes)) {
      throw Error(`Invalid unit: ${unit}`);
    }

    if (scopes[unit].indexOf(scope) === -1) {
      return getDefault(unit);
    }

    return scope;
  },
  getDefault: getDefault
};
