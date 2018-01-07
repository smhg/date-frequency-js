'use strict';

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
  filter: unit => {
    if (!unit) {
      return undefined;
    }

    unit = names[unit] || unit;

    if (util.order.concat(['E']).indexOf(unit) === -1) {
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
  compare: (left, right) => {
    let leftIdx = util.order.indexOf(left);
    let rightIdx = util.order.indexOf(right);

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
  lower: unit => rest(util.order, util.order.indexOf(unit) + 1),
  /**
   * Get higher units
   * @param String unit Lower limit
   * @return Array The units higher than the lower limit
   */
  higher: unit => first(util.order, util.order.indexOf(unit)),
  /**
   * Get units between upper and lower limit
   * @param String left Upper limit
   * @param String right Lower limit
   * @return Array The units between upper and lower limit
   */
  between: (left, right) => {
    let result = [];

    if (left !== right) {
      let lower = util.lower(left);

      result = first(lower, lower.indexOf(right));
    }

    return result;
  }
};

export default util;
