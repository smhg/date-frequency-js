'use strict';

var util = require('./util'),
  foreach = require('lodash.foreach'),
  last = require('lodash.last'),
  reduce = require('lodash.reduce'),
  pick = require('lodash.pick'),
  difference = require('lodash.difference'),
  union = require('lodash.union'),
  values = require('lodash.values'),
  indexof = require('lodash.indexof');

var stringPattern = new RegExp([
      '^F',
      '(?:(\\d+|\\(\\w*\\))Y(?:\\/([E]{1}))?)?',
      '(?:(\\d+|\\(\\w*\\))M(?:\\/([EY]{1}))?)?',
      '(?:(\\d+|\\(\\w*\\))W(?:\\/([EYM]{1}))?)?',
      '(?:(\\d+|\\(\\w*\\))D(?:\\/([EYMW]{1}))?)?',
      '(?:T',
      '(?:(\\d+|\\(\\w*\\))H(?:\\/([EYMWD]{1}))?)?',
      '(?:(\\d+|\\(\\w*\\))M(?:\\/([EYMWDH]{1}))?)?',
      '(?:(\\d+|\\(\\w*\\))S(?:\\/([EYMWDHM]{1}))?)?',
      ')?$'
    ].join(''));

var Frequency = function (rules) {
  rules = rules || {};
  this.rules = {};

  if (typeof rules === 'string') {
    var units = ['Y', 'M', 'W', 'D', 'h', 'm', 's'],
      matches = stringPattern.exec(rules).slice(1);

    if (matches.length <= 0) {
      throw new Error('Invalid frequency \"' + rules + '\"');
    }

    rules = {};

    for (var i = 0; i < matches.length; i += 2) {
      if (matches[i]) {
        var u = units[i / 2];

        rules[u] = {};

        if (matches[i][0] === '(') {
          rules[u].fn = matches[i].replace(/^\(/, '').replace(/\)$/, '');
        } else {
          rules[u].fix = parseInt(matches[i], 10);
        }

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

  if (typeof options !== 'object') {
    options = {fix: options};
    if (arguments.length === 3) {
      options.scope = arguments[2];
    }
  }

  this.rules[unit] = {
    scope: util.scope.filter(unit, util.unit.filter(options.scope))
  };

  if (options.fn) {
    if (!Frequency.fn[options.fn]) {
      throw 'Filter function \'' + options.fn + '\' not available';
    }

    this.rules[unit].fn = options.fn;
  } else {
    this.rules[unit].fix = options.fix || util.unit.defaults[unit];
  }

  return this;
};

/**
 * Retrieve value for unit (within default or specified scope)
 * @param {String} unit Date unit
 * @param {String} scope Date unit scope
 * @return {Number} Fix value
 */
Frequency.prototype.getValue = function (unit, scope) {
  var rules = this.rules;

  unit = util.unit.filter(unit);
  scope = util.scope.filter(unit, util.unit.filter(scope));

  if (!rules[unit] || rules[unit].scope !== scope) {
    return undefined;
  }

  var rule = rules[unit];

  if ('fix' in rule) {
    return rule.fix;
  } else if ('fn' in rule) {
    return rule.fn;
  }
};

Frequency.prototype.next = function (date) {
  date = util.date.clone(util.date.convert(date));

  var rules = this.rules,
    scopes = reduce(util.unit.defaults, function (result, def, u) {
        result[u] = rules[u] && rules[u].scope ? rules[u].scope : util.scope.getDefault(u);
        return result;
      }, {}),
    resetUnit = function (parent) {
        // parent = optional parent unit below which we are doing the reset
        return function (u) {
          if (scopes[u]) {
            if (parent && util.unit.compare(scopes[u], parent) === -1) {
              // unit scope is higher than parent, limit to parent scope
              util.date.sub(date, u, util.date.getValue(u, parent, date) - util.unit.defaults[u]);
            } else {
              util.date.sub(date, u, util.date.getValue(u, scopes[u], date) - util.unit.defaults[u]);
            }
          }
        };
      },
    fixedUnits = reduce(rules, function (result, rule, unit) {
      if ('fix' in rule) {
        result.push(unit);
      }
      return result;
    }, []),
    getIdx = function (idx) {
        return function (result, s, i) {
          if (s === idx) {
            result = i;
          }
          return result;
        };
      },
    filter = function (d, unit, rule) {
      if (rule) {
        var fn = Frequency.fn[rule.fn];

        var success = fn(util.date.getValue(unit, rule.scope, d), d);

        if (!success) {
          do {
            util.date.add(d, unit, 1);
          } while (!fn(util.date.getValue(unit, rule.scope, d), d));

          foreach(util.unit.lower(unit), resetUnit(unit));
        }
      }
    };

  var defaults = util.unit.defaults;

  for (var i = 0; i < util.unit.order.length; i++) {
    var unit = util.unit.order[i],
      rule = rules[unit];

    if (rule) {
      if ('fix' in rule) {
        var datePart = util.date.getValue(unit, rule.scope, date);

        if (datePart < rule.fix) {
          util.date.add(date, unit, rule.fix - datePart);

          // reset everything below current unit
          foreach(util.unit.lower(unit), resetUnit(unit));
        } else if (datePart > rule.fix) {
          // find closest non fixed parent
          var parent = last(difference(values(pick(scopes, union(util.unit.higher(unit), [unit]))), fixedUnits)),
            parentUnit = reduce(scopes, getIdx(parent)),
            reset;

          // raise that parent
          util.date.add(date, parent, 1);
          if (rules[parent] && 'fn' in rules[parent]) {
            filter(date, parent, rules[parent]);
          }

          // reset everything below that parent (except for fixed values above the current unit)
          reset = union(difference(util.unit.between(parentUnit, unit), fixedUnits), [unit], util.unit.lower(unit));
          foreach(reset, resetUnit());

          // set unit to fix value
          util.date.add(date, unit, rule.fix - defaults[unit]);
        }
      } else if ('fn' in rule) {
        filter(date, unit, rule);
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
  for (var i = 0; i < util.unit.order.length; i++) {
    var unit = util.unit.order[i],
      rule1 = this.rules[unit],
      rule2 = frequency.rules[unit];

    if (!rule1 && rule2) {
      return -1;
    } else if (rule1 && !rule2) {
      return 1;
    } else if (rule1 && rule2) {
      var scope = rule1.scope;

      if (scope === rule2.scope) {
        var value1 = this.getValue(unit, scope),
          value2 = frequency.getValue(unit, scope);

        if (value1 < value2) {
          return -1;
        } else if (value1 > value2) {
          return 1;
        }
      }
    }
  }

  return 0;
};

Frequency.prototype.toString = function () {
  var str = 'F',
    hasTime = false,
    order = util.unit.order;

  for (var i = 0; i < order.length; i++) {
    var unit = order[i];

    if (unit in this.rules) {
      var rule = this.rules[unit];

      if (!hasTime && indexof(['h', 'm', 's'], unit) >= 0) {
        str += 'T';
        hasTime = true;
      }

      if ('fix' in rule) {
        str += rule.fix;
      } else if ('fn' in rule) {
        str += '(' + rule.fn + ')';
      }

      str += unit.toUpperCase();

      if (rule.scope && rule.scope !== util.scope.getDefault(unit)) {
        str += '/' + rule.scope;
      }
    }
  }

  return str;
};

Frequency.fn = {};

module.exports = Frequency;
