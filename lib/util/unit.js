var rest = require('lodash.rest'),
  first = require('lodash.first'),
  indexof = require('lodash.indexof');

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
    'D': 1,
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

    if (indexof(order.concat(['W']), unit) < 0) {
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
    return rest(order, indexof(order, unit) + 1);
  },
  higher: function (unit) {
    return first(order, indexof(order, unit));
  },
  between: function (left, right) {
    var lower = util.lower(left);
    return first(lower, indexof(lower, right));
  }
};

module.exports = util;
