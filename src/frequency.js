'use strict';

import util from './util';
import values from 'lodash.values';
import last from 'lodash.last';
import difference from 'lodash.difference';
import pick from 'lodash.pick';
import union from 'lodash.union';
import createDebug from 'debug';

const debug = createDebug('date-frequency');

const stringPattern = new RegExp([
  '^F',
  '(?:(\\d+|\\(\\w*\\))Y(?:\\/([E]{1}))?)?',
  '(?:(\\d+|\\(\\w*\\))M(?:\\/([EY]{1}))?)?',
  '(?:(\\d+|\\(\\w*\\))W(?:\\/([EYM]{1}))?)?',
  '(?:(\\d+|\\(\\w*\\))D(?:\\/([EYMW]{1}))?)?',
  '(?:T',
  '(?:(\\d+|\\(\\w*\\))H(?:\\/([EYMWD]{1}))?)?',
  '(?:(\\d+|\\(\\w*\\))M(?:\\/([EYMWDH]{1}))?)?',
  '(?:(\\d+|\\(\\w*\\))S(?:\\/([EYMWDHM]{1}))?)?',
  ')?$'
].join(''));

const Frequency = function (rules) {
  // make new optional
  if (!(this instanceof Frequency)) {
    return new Frequency(rules);
  }

  rules = rules || {};
  this.rules = {};
  debug('constructor', rules);

  if (typeof rules === 'string') {
    let units = ['Y', 'M', 'W', 'D', 'h', 'm', 's'];
    let matches = stringPattern.exec(rules).slice(1);

    if (matches.length <= 0) {
      throw Error(`Invalid frequency "${rules}"`);
    }

    rules = {};

    for (let i = 0; i < matches.length; i += 2) {
      if (matches[i]) {
        let u = units[i / 2];

        rules[u] = {};

        if (matches[i][0] === '(') {
          rules[u].fn = matches[i].replace(/^\(/, '').replace(/\)$/, '');
        } else {
          rules[u].fix = parseInt(matches[i], 10);
        }

        if (matches[i + 1]) {
          rules[u].scope = matches[i + 1];
        }
      }
    }
  }

  for (let unit in rules) {
    if (rules.hasOwnProperty(unit)) {
      this.on(unit, rules[unit]);
    }
  }

  debug('constructor', rules);
};

Frequency.prototype.on = function (unit, options) {
  unit = util.unit.filter(unit);

  if (unit === undefined) {
    throw Error('Invalid unit');
  }

  if (typeof options !== 'object') {
    options = {fix: options};
    if (arguments.length === 3) {
      options.scope = arguments[2];
    }
  }

  this.rules[unit] = {
    scope: util.scope.filter(unit, util.unit.filter(options.scope))
  };

  if (options.fn) {
    if (!Frequency.fn[options.fn]) {
      throw Error(`Filter function "${options.fn}" not available`);
    }

    this.rules[unit].fn = options.fn;
  } else {
    this.rules[unit].fix = options.fix || util.unit.defaults[unit];
  }

  return this;
};

/**
 * Retrieve value for unit (within default or specified scope)
 * @param {String} unit Date unit
 * @param {String} scope Date unit scope
 * @return {Number} Fix value
 */
Frequency.prototype.getValue = function (unit, scope) {
  let rules = this.rules;

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

Frequency.prototype.next = function (date) {
  date = util.date.clone(util.date.convert(date));
  debug('next', date);

  let rules = this.rules;
  let scopes = Object.keys(util.unit.defaults)
    .reduce((result, u) => {
      result[u] = rules[u] && rules[u].scope ? rules[u].scope : util.scope.getDefault(u);
      return result;
    }, {});
  let resetUnit = function (parent) {
    // parent = optional parent unit below which we are doing the reset
    return function (u) {
      debug('next', 'reset ' + u);
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
      let fn = Frequency.fn[rule.fn];

      let success = fn(util.date.getValue(unit, rule.scope, d), d);

      if (!success) {
        do {
          debug('next', 'filter failed, adding 1', unit);
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
        debug('next', 'setting', unit, 'from', datePart, 'to', rule.fix);

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
        debug('next', 'filter ' + rule.fn + '() for ' + unit);
        let filterChangedSomething = filter(date, unit, rule);

        if (filterChangedSomething) {
          util.unit.lower(unit).forEach(resetUnit(unit));
        }
      }
      debug('next', date);
    }
  }

  return date;
};

Frequency.prototype.between = function (start, end) {
  let result = [];
  let d = util.date.clone(util.date.convert(start));

  end = util.date.convert(end);

  d = this.next(d);
  while (d < end) {
    result.push(util.date.clone(d));
    util.date.add(d, 's', 1);
    d = this.next(d);
  }

  return result;
};

Frequency.prototype.compare = function (frequency) {
  for (let i = 0; i < util.unit.order.length; i++) {
    let unit = util.unit.order[i];
    let rule1 = this.rules[unit];
    let rule2 = frequency.rules[unit];

    if (!rule1 && rule2) {
      return -1;
    } else if (rule1 && !rule2) {
      return 1;
    } else if (rule1 && rule2) {
      let scope = rule1.scope;

      if (scope === rule2.scope) {
        let value1 = this.getValue(unit, scope);
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

Frequency.prototype.toString = function () {
  let str = 'F';
  let hasTime = false;
  let order = util.unit.order;

  for (let i = 0; i < order.length; i++) {
    let unit = order[i];

    if (unit in this.rules) {
      let rule = this.rules[unit];

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

Frequency.fn = {};

export default Frequency;
