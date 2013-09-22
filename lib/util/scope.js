var scopes = {
  'M': 'Y',
  'W': 'Y',
  'D': ['W', 'M'],
  'h': 'D',
  'm': 'h',
  's': 'm'
};

function isArray(arr) {
  return Object.prototype.toString.call(arr) === '[object Array]';
}

function getDefault (unit) {
  if (!(unit in scopes)) {
    throw new Error('Invalid unit');
  }

  if (isArray(scopes[unit])) {
    return scopes[unit][0];
  } else {
    return scopes[unit];
  }
}

module.exports = {
  scopes: scopes,
  filter: function (unit, scope) {
    if (!(unit in scopes)) {
      throw new Error('Invalid unit');
    }

    if (isArray(scopes[unit])) {
      if (scopes[unit].indexOf(scope) < 0) {
        return getDefault(unit);
      }
    } else if (scopes[unit] !== scope) {
      return getDefault(unit);
    }

    return scope;
  },
  getDefault: getDefault
};
