var util = require('./util'),
  foreach = require('lodash.foreach'),
  keys = require('lodash.keys'),
  last = require('lodash.last'),
  rest = require('lodash.rest'),
  reduce = require('lodash.reduce'),
  pick = require('lodash.pick'),
  difference = require('lodash.difference'),
  union = require('lodash.union'),
  values = require('lodash.values'),
  indexof = require('lodash.indexof'),
  stringPattern = new RegExp([
    '^F',
    '(?:(\\d+)M(?:\\/([Y]{1}))?)?',
    '(?:(\\d+)D(?:\\/([YMW]{1}))?)?',
    '(?:T',
    '(?:(\\d+)H(?:\\/([YMWD]{1}))?)?',
    '(?:(\\d+)M(?:\\/([YMWDH]{1}))?)?',
    '(?:(\\d+)S(?:\\/([YMWDHM]{1}))?)?',
    ')?$'
  ].join(''));

var Frequency = function (rules) {
  rules = rules || {};
  this.rules = {};

  if (typeof rules === 'string') {
    var units = ['M', 'D', 'h', 'm', 's'],
      matches = rest(stringPattern.exec(rules));

    if (matches.length <= 0) {
      throw new Error('Invalid frequency \"' + rules + '\"');
    }

    rules = {};
    for (var i = 0;i < matches.length;i += 2) {
      if (matches[i]) {
        var u = units[i / 2];

        rules[u] = {
          fix: parseInt(matches[i], 10)
        };

        if (matches[i + 1]) {
          rules[u].scope = matches[i + 1];
        }
      }
    }
  }

  for (var unit in rules) {
    if (rules.hasOwnProperty(unit)) {
      this.on(unit, rules[unit]);
    }
  }
};

Frequency.prototype.on = function (unit, options) {
  unit = util.unit.filter(unit);

  if (unit === undefined) {
    throw new Error('Invalid unit');
  }

  if (unit === 'Y') {
    // rules on first unit (year) are not possible
    throw new Error('Invalid rule');
  }

  if (typeof options !== 'object') {
    options = {fix: options};
    if (arguments.length === 3) {
      options.scope = arguments[2];
    }
  }

  this.rules[unit] = {
    fix: options.fix || util.unit.defaults[unit],
    scope: util.scope.filter(unit, util.unit.filter(options.scope))
  };

  return this;
};

/**
 * Retrieve value for unit (within default or specified scope)
 * @param {String} unit Date unit
 * @param {String} scope Date unit scope
 * @return {Number} Fix value
 */
Frequency.prototype.getValue = function (unit, scope) {
  unit = util.unit.filter(unit);
  scope = util.scope.filter(unit, util.unit.filter(scope));

  if (!this.rules[unit] || this.rules[unit].scope !== scope) {
    return undefined;
  }

  return this.rules[unit].fix;
};

Frequency.prototype.next = function (date) {
  date = util.date.clone(util.date.convert(date));

  var rules = this.rules,
    scopes = reduce(util.unit.defaults, function (result, def, u) {
      result[u] = rules[u] && rules[u].scope ? rules[u].scope : util.scope.getDefault(u);
      return result;
    }, {}),
    resetUnit = function (u) {
      util.date.sub(date, u, util.date.get[u][scopes[u]](date) - util.unit.defaults[u]);
    },
    fixedUnits = keys(rules),
    getIdx = function (parent) {
      return function (result, s, i) {
        if (s === parent) {
          result = i;
        }
        return result;
      };
    };

  for (var unit in util.unit.defaults) {
    if (util.unit.defaults.hasOwnProperty(unit)) {
      var rule = rules[unit];

      if (rule) {
        var datePart = util.date.get[unit][rule.scope](date);

        if (datePart < rule.fix) {
          util.date.add(date, unit, rule.fix - datePart);

          // reset everything below current unit
          foreach(util.unit.lower(unit), resetUnit);
        } else if (datePart > rule.fix) {
          // add one to closest non fixed parent

          var parent = last(difference(values(pick(scopes, union(util.unit.higher(unit), [unit]))), fixedUnits));
          var parentUnit = reduce(scopes, getIdx(parent));
          util.date.add(date, parent, 1);

          // reset everything below that parent (except for fixed values above the current unit)
          var reset = union(difference(util.unit.between(parentUnit, unit), fixedUnits), [unit], util.unit.lower(unit));
          foreach(reset, resetUnit);

          util.date.add(date, unit, rule.fix - util.unit.defaults[unit]);
        }
      }
    }
  }

  return date;
};

Frequency.prototype.between = function (start, end) {
  var result = [],
    d = util.date.clone(util.date.convert(start));

  end = util.date.convert(end);

  d = this.next(d);
  while (d < end) {
    result.push(util.date.clone(d));
    util.date.add(d, 's', 1);
    d = this.next(d);
  }

  return result;
};

Frequency.prototype.compare = function (frequency) {
  // warning: only compares those units that appear in both frequencies, with both the same scope!
  for (var i = 0;i < util.unit.order.length;i++) {
    var unit = util.unit.order[i];
    if (this.rules[unit] && frequency.rules[unit] && this.rules[unit].scope === frequency.rules[unit].scope) {
      if (this.rules[unit].fix < frequency.rules[unit].fix) {
        return -1;
      } else if (this.rules[unit].fix > frequency.rules[unit].fix) {
        return 1;
      }
    }
  }

  return 0;
};

Frequency.prototype.toString = function () {
  var str = 'F',
    hasTime = false,
    order = util.unit.order;

  for (var i = 0;i < order.length;i++) {
    var unit = order[i];

    if (unit in this.rules) {
      var rule = this.rules[unit];

      if (!hasTime && indexof(['h', 'm', 's'], unit) >= 0) {
        str += 'T';
        hasTime = true;
      }
      str += rule.fix + unit.toUpperCase();
      if (rule.scope && rule.scope !== util.scope.getDefault(unit)) {
        str += '/' + rule.scope;
      }
    }
  }

  return str;
};

module.exports = Frequency;
