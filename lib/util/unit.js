var _ = require('underscore');

var order = ['Y', 'M', 'D', 'h', 'm', 's'],
  names = {
    'year': 'Y',
    'month': 'M',
    'week': 'W',
    'day': 'D',
    'hour': 'h',
    'minute': 'm',
    'second': 's'
  };

var util = {
  defaults: {
    'M': 1,
    'D': {
      'W': 0,
      'M': 1
    },
    'h': 0,
    'm': 0,
    's': 0
  },
  /**
   * Filter unit according to predefined values
   * @param String unit The unit to clean up
   * @return String|undefined The filtered unit
   */
  filter: function (unit) {
    if (!unit) {
      return undefined;
    }

    unit = names[unit] || unit;

    if (order.concat(['W']).indexOf(unit) < 0) {
      return undefined;
    }

    return unit;
  },
  /**
   * Get units lower than specified unit
   * @param String unit Upper limit
   * @return Array The units lower than the specified limit
   */
  lower: function (unit) {
    return _.rest(order, order.indexOf(unit) + 1);
  },
  higher: function (unit) {
    return _.first(order, order.indexOf(unit));
  },
  between: function (left, right) {
    var lower = util.lower(left);
    return _.first(lower, lower.indexOf(right));
  }
};

module.exports = util;
