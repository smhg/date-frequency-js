import {
  filter as filterUnit,
  defaults as unitDefaults,
  order as unitOrder,
  lower as lowerUnit
} from './util/unit';
import {
  filter as filterScope,
  getDefault as defaultScope,
  scopes as allScopes
} from './util/scope';
import {
  clone as cloneDate,
  convert as convertDate,
  getValue as getDateValue,
  sub as dateSub,
  add as dateAdd
} from './util/date';
import createDebug from 'debug';
import parseRules from './rule';

const debug = createDebug('date-frequency');

/**
 * @constructor
 */
function createFrequency (rules) {
  rules = rules || {};

  if (typeof rules === 'string') {
    debug('parse', rules);

    rules = parseRules(rules);
  }

  // check function existence
  Object.keys(rules).forEach(unit => {
    Object.keys(rules[unit]).forEach(scope => {
      if (!Number.isInteger(rules[unit][scope]) && !createFrequency.fn[rules[unit][scope]]) {
        throw Error(`Filter function "${rules[unit][scope]}" not available`);
      }
    });
  });

  debug('rules', rules);

  /**
   * Add a rule
   * @param {string} unit The unit for which this rule applies
   * @param {number|string} value The value on which to fix this unit or the name of a function
   * @param {string} [scope] The scope for which to fix this unit
   * @return {Object} A new frequency
   */
  function on (unit, value, scope) {
    unit = filterUnit(unit);

    if (typeof unit === 'undefined') {
      throw Error(`Invalid unit: ${unit}`);
    }

    scope = filterScope(unit, filterUnit(scope));

    return createFrequency(Object.assign(
      {},
      rules,
      { [unit]: Object.assign({}, rules[unit], { [scope]: value }) }
    ));
  };

  /**
   * Get value for unit (within default or specified scope)
   * @param {string} unit The unit
   * @param {string} [scope] The scope
   * @return {number|string} Fix value or function
   */
  function getValue (unit, scope) {
    unit = filterUnit(unit);
    scope = filterScope(unit, filterUnit(scope));

    if (!(unit in rules)) {
      return;
    }

    if (!(scope in rules[unit])) {
      return;
    }

    return rules[unit][scope];
  };

  /**
   * Find the next occurence of the frequency
   * @param {Date} [date=new Date()] The reference date after (or on) which to find the next date
   * @return {Date} The next date according to the ruleset
   */
  function next (date = new Date()) {
    const debug = createDebug('date-frequency:next');

    date = cloneDate(convertDate(date));

    debug('in', date.toString());

    for (let i = unitOrder.length - 1; i >= 0; i--) {
      const unit = unitOrder[i];

      if (!(unit in rules)) {
        continue;
      } else {
        const rule = rules[unit];

        const scopes = allScopes[unit].filter(scope => scope in rule);

        let safety = 0;
        for (let j = 0; j < scopes.length; j++) {
          if (++safety > createFrequency.MAX_ATTEMPTS) {
            throw new Error(`Gave up after ${createFrequency.MAX_ATTEMPTS} to find a match for ${unit}.`);
          }

          const scope = scopes[j];
          const ruleValue = rule[scope];
          const dateValue = getDateValue(unit, scope, date);

          if (Number.isInteger(ruleValue)) {
            if (ruleValue === dateValue) {
              debug(`${unit}/${scope} matches rule`);
              continue;
            }

            debug(`${unit}/${scope} (${dateValue}) does not match rule (${ruleValue})`);
            if (dateValue < ruleValue) {
              debug(`setting ${unit} to ${ruleValue}`);
              dateAdd(date, unit, ruleValue - dateValue);

              lowerUnit(unit)
                .filter(unit => unit in unitDefaults && !(unit in rules))
                .forEach(unit => {
                  const dateValue = getDateValue(unit, defaultScope(unit), date);

                  if (dateValue !== unitDefaults[unit]) {
                    debug(`setting ${unit} to ${unitDefaults[unit]}`);
                    dateSub(date, unit, dateValue - unitDefaults[unit]);
                  }
                });
              continue;
            }

            if (dateValue > ruleValue) {
              debug(`setting ${unit} to ${ruleValue}`);
              dateSub(date, unit, dateValue - ruleValue);
              debug(`adding 1 ${scope}`);
              dateAdd(date, scope, 1);

              lowerUnit(unit)
                .filter(unit => unit in unitDefaults && !(unit in rules))
                .forEach(unit => {
                  const dateValue = getDateValue(unit, defaultScope(unit), date);

                  if (dateValue !== unitDefaults[unit]) {
                    debug(`setting ${unit} to ${unitDefaults[unit]}`);
                    dateSub(date, unit, dateValue - unitDefaults[unit]);
                  }
                });

              j = -1; // check all scopes of this unit again

              continue;
            }
          } else {
            debug(`filter ${ruleValue}() for ${unit}/${scope}`);

            const fn = createFrequency.fn[ruleValue];

            let success = fn(getDateValue(unit, scope, date), date);

            if (!success) {
              do {
                debug(`filter failed, adding 1 ${unit}`);
                dateAdd(date, unit, 1);
              } while (!fn(getDateValue(unit, scope, date), date));

              j = -1; // check all scopes of this unit again
            }
          }
        }
      }
    }

    debug('out', date.toString());

    return date;
  };

  /**
   * Find occurences between a start and end date
   * @param {Date} [start] The start date
   * @param {Date} [end] The end date
   * @return {Date[]} The orrurences between both dates
   */
  function between (start, end) {
    let result = [];
    let d = cloneDate(convertDate(start));

    end = convertDate(end);

    debug('between', d, end);

    d = next(d);
    while (d < end) {
      result.push(cloneDate(d));
      dateAdd(d, 's', 1);
      d = next(d);
    }

    return result;
  };

  /**
   * Compare with another frequency to determine sort order
   * @param {Object} frequency The frequency with which to compare with
   * @return {number} -1, 0 or 1
   */
  function compare (frequency) {
    for (let i = 0; i < unitOrder.length; i++) {
      const unit = unitOrder[i];
      const leftRules = rules;
      const rightRules = frequency.rules;

      if (!(unit in leftRules) && unit in rightRules) {
        return -1;
      } else if (unit in leftRules && !(unit in rightRules)) {
        return 1;
      } else if (unit in leftRules && unit in rightRules) {
        const leftRule = leftRules[unit];
        const rightRule = rightRules[unit];
        const scopes = allScopes[unit];
        for (let j = 0; j < scopes.length; j++) {
          const scope = scopes[j];
          if (!(scope in leftRule) && scope in rightRule) {
            return -1;
          } else if (scope in leftRule && !(scope in rightRule)) {
            return 1;
          } else if (scope in leftRule && scope in rightRule) {
            const leftValue = getValue(unit, scope);
            const rightValue = frequency.getValue(unit, scope);

            if (leftValue < rightValue) {
              return -1;
            } else if (leftValue > rightValue) {
              return 1;
            }
          }
        }
      }
    }

    return 0;
  };

  /**
   * Convert the ruleset to a string
   * @return {string} An ISO-style representation of the ruleset
   */
  function toString () {
    let timeAdded = false;

    return unitOrder
      .filter(unit => unit in rules)
      .reduce((str, unit) => {
        let rule = rules[unit];

        if (['h', 'm', 's'].indexOf(unit) >= 0 && !timeAdded) {
          str += 'T';
          timeAdded = true;
        }

        return allScopes[unit]
          .filter(scope => scope in rule) // guarantees fixed order
          .reduce((str, scope) => {
            const value = rule[scope];
            if (Number.isInteger(value)) {
              str += value;
            } else {
              str += `(${value})`;
            }

            str += unit.toUpperCase();

            if (scope && scope !== defaultScope(unit)) {
              str += `/${scope}`;
            }

            return str;
          }, str);
      }, 'F');
  };

  return Object.freeze({
    rules,
    on,
    getValue,
    next,
    between,
    compare,
    toString
  });
};

createFrequency.fn = {};
createFrequency.MAX_ATTEMPTS = 100;

export default createFrequency;
