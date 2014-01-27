var util = require('./util'),
  _ = require('underscore');

var Frequency = function (rules) {
  rules = rules || {};

  this.rules = {};

  _.each(rules, function (options, unit) {
    this.on(unit, options);
  }, this);
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
    scope: util.scope.filter(unit, options.scope)
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

  var rules = this.rules;

  _.each(_.keys(util.unit.defaults), function (unit) {
    var rule = rules[unit],
      dateParts = util.date.toObject(date);

    if (rule) {
      var datePart = dateParts[unit][rule.scope];

      if (datePart < rule.fix) {
        util.date.add(date, unit, rule.fix - datePart);

        // reset everything below current unit
        _.each(util.unit.lower(unit), function (u) {
          util.date.sub(date, u, dateParts[u][util.scope.getDefault(u)]);
        });
      } else if (datePart > rule.fix) {
        // add one to first non fixed parent
        var parent = _.last(_.difference(util.unit.higher(unit), _.keys(rules)));
        util.date.add(date, parent, 1);

        // reset everything below that parent (except for fixed values above the current unit)
        var reset = _.union(_.difference(util.unit.between(parent, unit), _.keys(rules)), [unit], util.unit.lower(unit));
        _.each(reset, function (u) {
          util.date.sub(date, u, dateParts[u][util.scope.getDefault(u)]);
        });

        util.date.add(date, unit, rule.fix);
      }
    }
  }, this);

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
