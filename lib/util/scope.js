var _ = require('underscore');

var scopes = {
  'M': 'Y',
  'W': 'Y',
  'D': ['W', 'M'],
  'h': 'D',
  'm': 'h',
  's': 'm'
};

var isArray = function (arr) {
  return Object.prototype.toString.call(arr) === '[object Array]';
};

var getDefault = function (unit) {
  if (!(unit in scopes)) {
    throw new Error('Invalid unit');
  }

  if (isArray(scopes[unit])) {
    return scopes[unit][0];
  } else {
    return scopes[unit];
  }
};

module.exports = {
  filter: function (unit, scope) {
    if (!(unit in scopes)) {
      throw new Error('Invalid unit');
    }

    if (isArray(scopes[unit])) {
      if (_.indexOf(scopes[unit], scope) < 0) {
        return getDefault(unit);
      }
    } else if (scopes[unit] !== scope) {
      return getDefault(unit);
    }

    return scope;
  },
  getDefault: getDefault
};
