import scopeUtil from './util/scope';
import unitUtil from './util/unit';

const stringPattern = RegExp([
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

function parseRules (string) {
  let units = unitUtil.order;
  let matches = stringPattern.exec(string).slice(1);

  if (matches.length <= 0) {
    throw Error(`Invalid frequency "${string}"`);
  }

  let rules = {};

  for (let i = 0; i < matches.length; i += 2) {
    if (matches[i]) {
      let u = units[i / 2];
      let rule = {};

      if (matches[i][0] === '(') {
        rule.fn = matches[i].replace(/^\(/, '').replace(/\)$/, '');
      } else {
        rule.fix = parseInt(matches[i], 10);
      }

      if (matches[i + 1]) {
        rule.scope = matches[i + 1];
      }

      rules[u] = rule;
    }
  }

  return rules;
}

function createRule (unit, options) {
  let rule = {
    scope: scopeUtil.filter(unit, unitUtil.filter(options.scope))
  };

  if (options.fn) {
    rule.fn = options.fn;
  } else {
    rule.fix = options.fix || unitUtil.defaults[unit];
  }

  return Object.freeze(rule);
}

export default createRule;
export {parseRules};
