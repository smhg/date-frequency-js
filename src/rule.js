import { filter as filterScope } from './util/scope';
import { defaults as unitDefaults } from './util/unit';

const stringValidation = /^F((\d+|\(\w+\))[YMWD](?:\/[EYMW])?)*(?:T((\d+|\(\w+\))[HMS](?:\/[EYMWDH])?)*)?$/;

const ruleParser = /(\d+|\(\w+\))([YMWDHS])(?:\/([EYMWDH]))?/g;

export default function parseRules (string) {
  if (!stringValidation.test(string)) {
    throw Error(`Invalid frequency "${string}"`);
  }

  const rules = {};

  const [date, time] = string.split(/T(?![^(]*\))/);

  const addRule = (value, unit, scope) => {
    if (!(scope = filterScope(unit, scope))) {
      return;
    }

    const scopes = rules[unit] || {};

    if (!value) {
      value = unitDefaults[unit];
    } else if (value[0] === '(') {
      value = value.substr(1, value.length - 2);
    } else {
      value = parseInt(value, 10);
    }

    scopes[scope] = value;

    rules[unit] = scopes;
  };

  let result;

  while ((result = ruleParser.exec(date)) !== null) {
    const [, value, unit, scope] = result;
    addRule(value, unit, scope);
  }

  while ((result = ruleParser.exec(time)) !== null) {
    // scopes for time parts are fixed
    const [, value, unit] = result;
    addRule(value, unit.toLowerCase());
  }

  return rules;
}
