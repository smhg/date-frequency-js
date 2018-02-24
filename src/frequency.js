'use strict';

import util from './util';
import difference from 'lodash.difference';
import pick from 'lodash.pick';
import union from 'lodash.union';
import createDebug from 'debug';
import createRule, {parseRules} from './rule';

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

  for (let unit in rules) {
    if (rules.hasOwnProperty(unit)) {
      let rule = rules[unit];
      let u = util.unit.filter(unit);

      rules[u] = createRule(u, rule);

      if (rules[u].fn && !createFrequency.fn[rules[u].fn]) {
        throw Error(`Filter function "${rules[u].fn}" not available`);
      }
    }
  }

  debug('rules', rules);

  /**
   * Add a rule
   * @param {string} unit The unit for which this rule applies
   * @param {Object|string} options The value on which to fix this unit or an options object
   * @param {string} [scope] The scope for which to fix this unit
   * @return {Object} A new frequency
   */
  function on (unit, options, scope) {
    unit = util.unit.filter(unit);

    if (typeof unit === 'undefined') {
      throw Error(`Invalid unit: ${unit}`);
    }

    if (typeof options !== 'object') {
      options = {fix: options};

      if (scope) {
        options.scope = scope;
      }
    }

    return createFrequency(Object.assign(
      {},
      rules,
      {[unit]: createRule(unit, options)}
    ));
  };

  /**
   * Get value for unit (within default or specified scope)
   * @param {string} unit The unit
   * @param {string} scope The scope
   * @return {number|Function} Fix value or function
   */
  function getValue (unit, scope) {
    unit = util.unit.filter(unit);
    scope = util.scope.filter(unit, util.unit.filter(scope));

    if (!rules[unit] || rules[unit].scope !== scope) {
      return undefined;
    }

    let rule = rules[unit];

    if ('fix' in rule) {
      return rule.fix;
    } else if ('fn' in rule) {
      return rule.fn;
    }
  };

  /**
   * Find the next occurence of the frequency
   * @param {Date} [date=new Date()] The reference date after (or on) which to find the next date
   * @return {Date} The next date according to the ruleset
   */
  function next (date) {
    if (date) {
      date = util.date.clone(util.date.convert(date));
    } else {
      date = new Date();
    }

    debug('next', 'in', date.toString());

    const defaults = util.unit.defaults;

    const scopes = Object.keys(defaults)
      .reduce((result, u) => {
        result[u] = rules[u] && rules[u].scope ? rules[u].scope : util.scope.getDefault(u);
        return result;
      }, {});

    const fixedUnits = Object.keys(rules)
      .filter(unit => 'fix' in rules[unit]);

    const createUnitResetter = function (defaults, scopes, belowUnit) {
      // belowUnit = optional parent unit below which we are doing the reset
      return function (unit) {
        const scope = scopes[unit];
        const def = defaults[unit];

        if (scope) {
          debug('next', `reset ${unit}`);

          let value;
          if (belowUnit && util.unit.compare(scope, belowUnit) === -1) {
            // unit scope is higher than parent, limit to parent scope
            value = util.date.getValue(unit, belowUnit, date);
          } else {
            value = util.date.getValue(unit, scope, date);
          }

          util.date.sub(date, unit, value - def);
        }
      };
    };

    const applyRuleFn = function (date, unit, {fn, scope}) {
      const f = createFrequency.fn[fn];

      let success = f(util.date.getValue(unit, scope, date), date);

      if (!success) {
        do {
          debug('next', `filter failed, adding 1 ${unit}`);
          util.date.add(date, unit, 1);
        } while (!f(util.date.getValue(unit, scope, date), date));

        return true;
      }

      return false;
    };

    util.unit.order
      .filter(unit => unit in rules)
      .forEach(unit => {
        const rule = rules[unit];

        if ('fix' in rule) {
          let datePart = util.date.getValue(unit, rule.scope, date);

          if (datePart !== rule.fix) {
            debug('next', `setting ${unit} (${rule.scope}) from ${datePart} to ${rule.fix}`);

            if (datePart < rule.fix) {
              util.date.add(date, unit, rule.fix - datePart);

              // reset everything below current unit
              util.unit.lower(unit).forEach(createUnitResetter(defaults, scopes, unit));
            } else if (datePart > rule.fix) {
              // find closest non fixed parent
              const parent = difference(
                Object.values(
                  pick(
                    scopes,
                    union(util.unit.higher(unit), [unit])
                  )
                ),
                fixedUnits
              )
                .slice(-1)[0]; // last value

              const parentUnit = Object.keys(scopes)
                .find(unit => scopes[unit] === parent);

              // raise that parent
              util.date.add(date, parent, 1);

              if (rules[parent] && 'fn' in rules[parent]) {
                applyRuleFn(date, parent, rules[parent]);
              }

              // reset everything below that parent (except for fixed values above the current unit)
              union(
                difference(
                  util.unit.between(parentUnit, unit),
                  fixedUnits
                ),
                [unit],
                util.unit.lower(unit)
              )
                .forEach(createUnitResetter(defaults, scopes));

              // set unit to fix value
              util.date.add(date, unit, rule.fix - defaults[unit]);
            }
          }
        } else if ('fn' in rule) {
          debug('next', `filter ${rule.fn}() for ${unit}`);
          const filterChangedSomething = applyRuleFn(date, unit, rule);

          if (filterChangedSomething) {
            // reset everything below current unit
            util.unit.lower(unit).forEach(createUnitResetter(defaults, scopes, unit));
          }
        }
      });

    debug('next', 'out', date.toString());

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
    let d = util.date.clone(util.date.convert(start));

    end = util.date.convert(end);

    debug('between', d, end);

    d = next(d);
    while (d < end) {
      result.push(util.date.clone(d));
      util.date.add(d, 's', 1);
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
    for (let i = 0; i < util.unit.order.length; i++) {
      let unit = util.unit.order[i];
      let rule1 = rules[unit];
      let rule2 = frequency.rules[unit];

      if (!rule1 && rule2) {
        return -1;
      } else if (rule1 && !rule2) {
        return 1;
      } else if (rule1 && rule2) {
        let scope = rule1.scope;

        if (scope === rule2.scope) {
          let value1 = getValue(unit, scope);
          let value2 = frequency.getValue(unit, scope);

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

  /**
   * Convert the ruleset to a string
   * @return {string} An ISO-style representation of the ruleset
   */
  function toString () {
    return util.unit.order
      .filter(unit => unit in rules)
      .reduce((str, unit, i) => {
        let rule = rules[unit];

        if (['h', 'm', 's'].indexOf(unit) >= 0 && str.indexOf('T') === -1) {
          str += 'T';
        }

        if ('fix' in rule) {
          str += rule.fix;
        } else if ('fn' in rule) {
          str += `(${rule.fn})`;
        }

        str += unit.toUpperCase();

        if (rule.scope && rule.scope !== util.scope.getDefault(unit)) {
          str += `/${rule.scope}`;
        }

        return str;
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

export default createFrequency;
