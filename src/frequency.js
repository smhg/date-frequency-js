'use strict';

import util from './util';
import values from 'lodash.values';
import last from 'lodash.last';
import difference from 'lodash.difference';
import pick from 'lodash.pick';
import union from 'lodash.union';
import createDebug from 'debug';
import createRule, {parseRules} from './rule';

const debug = createDebug('date-frequency');

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
   * Retrieve value for unit (within default or specified scope)
   * @param {String} unit Date unit
   * @param {String} scope Date unit scope
   * @return {Number} Fix value
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

  function next (date) {
    if (date) {
      date = util.date.clone(util.date.convert(date));
    } else {
      date = new Date();
    }

    debug('next', 'IN', date.toString());

    let scopes = Object.keys(util.unit.defaults)
      .reduce((result, u) => {
        result[u] = rules[u] && rules[u].scope ? rules[u].scope : util.scope.getDefault(u);
        return result;
      }, {});
    let resetUnit = function (parent) {
      // parent = optional parent unit below which we are doing the reset
      return function (u) {
        debug('next', `reset ${u}`);
        if (scopes[u]) {
          if (parent && util.unit.compare(scopes[u], parent) === -1) {
            // unit scope is higher than parent, limit to parent scope
            util.date.sub(date, u, util.date.getValue(u, parent, date) - util.unit.defaults[u]);
          } else {
            util.date.sub(date, u, util.date.getValue(u, scopes[u], date) - util.unit.defaults[u]);
          }
        }
      };
    };
    let fixedUnits = Object.keys(rules)
      .reduce((result, unit) => {
        if ('fix' in rules[unit]) {
          result.push(unit);
        }
        return result;
      }, []);
    let getIdx = function (scopes, idx) {
      return function (result, i) {
        if (scopes[i] === idx) {
          result = i;
        }
        return result;
      };
    };
    let filter = function (d, unit, rule) {
      if (rule) {
        let fn = createFrequency.fn[rule.fn];

        let success = fn(util.date.getValue(unit, rule.scope, d), d);

        if (!success) {
          do {
            debug('next', `filter failed, adding 1 ${unit}`);
            util.date.add(d, unit, 1);
          } while (!fn(util.date.getValue(unit, rule.scope, d), d));

          return true;
        }
      }

      return false;
    };

    let defaults = util.unit.defaults;

    for (let i = 0; i < util.unit.order.length; i++) {
      let unit = util.unit.order[i];
      let rule = rules[unit];

      if (rule) {
        if ('fix' in rule) {
          let datePart = util.date.getValue(unit, rule.scope, date);

          if (datePart === rule.fix) {
            continue;
          }

          debug('next', `setting ${unit} (${rule.scope}) from ${datePart} to ${rule.fix}`);

          if (datePart < rule.fix) {
            util.date.add(date, unit, rule.fix - datePart);

            // reset everything below current unit
            util.unit.lower(unit).forEach(resetUnit(unit));
          } else if (datePart > rule.fix) {
            // find closest non fixed parent
            let parent = last(difference(values(pick(scopes, union(util.unit.higher(unit), [unit]))), fixedUnits));
            let parentUnit = Object.keys(scopes).reduce(getIdx(scopes, parent));
            let reset;

            // raise that parent
            util.date.add(date, parent, 1);
            if (rules[parent] && 'fn' in rules[parent]) {
              filter(date, parent, rules[parent]);
            }

            // reset everything below that parent (except for fixed values above the current unit)
            reset = union(difference(util.unit.between(parentUnit, unit), fixedUnits), [unit], util.unit.lower(unit));
            reset.forEach(resetUnit());

            // set unit to fix value
            util.date.add(date, unit, rule.fix - defaults[unit]);
          }
        } else if ('fn' in rule) {
          debug('next', `filter ${rule.fn}() for ${unit}`);
          let filterChangedSomething = filter(date, unit, rule);

          if (filterChangedSomething) {
            util.unit.lower(unit).forEach(resetUnit(unit));
          }
        }
      }
    }

    debug('next', 'OUT', date.toString());

    return date;
  };

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

  function toString () {
    let str = 'F';
    let hasTime = false;
    let order = util.unit.order;

    for (let i = 0; i < order.length; i++) {
      let unit = order[i];

      if (unit in rules) {
        let rule = rules[unit];

        if (!hasTime && ['h', 'm', 's'].indexOf(unit) >= 0) {
          str += 'T';
          hasTime = true;
        }

        if ('fix' in rule) {
          str += rule.fix;
        } else if ('fn' in rule) {
          str += '(' + rule.fn + ')';
        }

        str += unit.toUpperCase();

        if (rule.scope && rule.scope !== util.scope.getDefault(unit)) {
          str += '/' + rule.scope;
        }
      }
    }

    return str;
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
