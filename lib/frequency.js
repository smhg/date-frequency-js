var util = require('./util'),
  _ = require('underscore');

function Frequency (rules) {
  rules = rules || {};

  this.rules = {};

  _.each(rules, function (options, unit) {
    this.on(unit, options);
  }, this);
}

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

Frequency.prototype.next = function (date) {
  date = util.date.clone(date);

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
    date = util.date.clone(start);

  util.date.add(date, 's', 1);
  date = this.next(date);
  while (date < end) {
    result.push(util.date.clone(date));
    util.date.add(date, 's', 1);
    date = this.next(date);
  }

  return result;
};

module.exports = Frequency;
