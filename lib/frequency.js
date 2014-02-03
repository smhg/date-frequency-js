var util = require('./util'),
  foreach = require('lodash.foreach'),
  keys = require('lodash.keys'),
  last = require('lodash.last'),
  difference = require('lodash.difference'),
  union = require('lodash.union');

var Frequency = function (rules) {
  rules = rules || {};

  this.rules = {};

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
  scope = util.scope.filter(unit, scope);

  if (!this.rules[unit] || this.rules[unit].scope !== scope) {
    return undefined;
  }

  return this.rules[unit].fix;
};

Frequency.prototype.next = function (date) {
  date = util.date.clone(util.date.convert(date));

  var rules = this.rules,
    resetUnit = function (u) {
      util.date.sub(date, u, util.date.get[u][util.scope.getDefault(u)](date) - util.unit.defaults[u]);
    },
    fixedUnits = keys(rules);

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
          var parent = last(difference(util.unit.higher(unit), fixedUnits));
          util.date.add(date, parent, 1);

          // reset everything below that parent (except for fixed values above the current unit)
          var reset = union(difference(util.unit.between(parent, unit), fixedUnits), [unit], util.unit.lower(unit));
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

module.exports = Frequency;
