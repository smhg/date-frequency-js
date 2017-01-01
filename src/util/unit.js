'use strict';

import indexof from 'lodash.indexof';

const first = function (arr, idx) {
  return arr.slice(0, idx);
};

const rest = function (arr, idx) {
  return arr.slice(idx);
};

const names = {
  'epoch': 'E',
  'year': 'Y',
  'month': 'M',
  'week': 'W',
  'day': 'D',
  'hour': 'h',
  'minute': 'm',
  'second': 's'
};

const util = {
  order: ['Y', 'M', 'W', 'D', 'h', 'm', 's'],
  defaults: {
    'Y': 0,
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

    if (indexof(util.order.concat(['E']), unit) < 0) {
      return undefined;
    }

    return unit;
  },
  /**
   * Compare order of units ("bigger" unit has precedence, eg Y before M)
   * @param String left First unit
   * @param String right Second unit
   * @return Number Compare result
   */
  compare: function (left, right) {
    let leftIdx = indexof(util.order, left);
    let rightIdx = indexof(util.order, right);

    if (leftIdx < rightIdx) {
      return -1;
    } else if (leftIdx === rightIdx) {
      return 0;
    } else {
      return 1;
    }
  },
  /**
   * Get lower units
   * @param String unit Upper limit
   * @return Array The units lower than the upper limit
   */
  lower: function (unit) {
    return rest(util.order, indexof(util.order, unit) + 1);
  },
  /**
   * Get higher units
   * @param String unit Lower limit
   * @return Array The units higher than the lower limit
   */
  higher: function (unit) {
    return first(util.order, indexof(util.order, unit));
  },
  /**
   * Get units between upper and lower limit
   * @param String left Upper limit
   * @param String right Lower limit
   * @return Array The units between upper and lower limit
   */
  between: function (left, right) {
    let result = [];

    if (left !== right) {
      let lower = util.lower(left);

      result = first(lower, indexof(lower, right));
    }

    return result;
  }
};

module.exports = util;
