const first = (arr, idx) => arr.slice(0, idx);
const rest = (arr, idx) => arr.slice(idx);

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

export const order = ['Y', 'M', 'W', 'D', 'h', 'm', 's'];

export const defaults = {
  'Y': 0,
  'M': 1,
  'D': 1,
  'h': 0,
  'm': 0,
  's': 0
};

/**
 * Filter unit according to predefined values
 * @param String unit The unit to clean up
 * @return String|undefined The filtered unit
 */
export function filter (unit) {
  if (!unit) {
    return undefined;
  }

  unit = names[unit] || unit;

  if (order.concat(['E']).indexOf(unit) === -1) {
    return undefined;
  }

  return unit;
};

/**
 * Compare order of units ("bigger" unit has precedence, eg Y before M)
 * @param String left First unit
 * @param String right Second unit
 * @return Number Compare result
 */
export function compare (left, right) {
  let leftIdx = order.indexOf(left);
  let rightIdx = order.indexOf(right);

  if (leftIdx < rightIdx) {
    return -1;
  } else if (leftIdx === rightIdx) {
    return 0;
  } else {
    return 1;
  }
};

/**
 * Get lower units
 * @param String unit Upper limit
 * @return Array The units lower than the upper limit
 */
export const lower = unit => rest(order, order.indexOf(unit) + 1);

/**
 * Get higher units
 * @param String unit Lower limit
 * @return Array The units higher than the lower limit
 */
export const higher = unit => first(order, order.indexOf(unit));

/**
 * Get units between upper and lower limit
 * @param String left Upper limit
 * @param String right Lower limit
 * @return Array The units between upper and lower limit
 */
export function between (left, right) {
  let result = [];

  if (left !== right) {
    let l = lower(left);

    result = first(l, l.indexOf(right));
  }

  return result;
};
