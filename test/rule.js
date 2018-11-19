'use strict';

import assert from 'assert';
import createRule, { parseRules } from '../src/rule';

describe('Rule', function () {
  describe('createRule()', function () {
    it('should', function () {
      const rule = createRule('D');
      assert.deepStrictEqual(rule, { fix: 1, scope: 'M' });
    });
  });
  describe('parseRules()', function () {
    it('should recognize missing T', function () {
      const rules = parseRules('F(inThirdWeek)W3D/W');
      assert.deepStrictEqual(rules, { W: { fn: 'inThirdWeek' }, D: { fix: 3, scope: 'W' } });
    });
    it('should not detect T in limit function', function () {
      const rules = parseRules('F(inThirdWeek)W3D/WT10H0M0S');
      assert.deepStrictEqual(rules, {
        W: { fn: 'inThirdWeek' },
        D: { fix: 3, scope: 'W' },
        h: { fix: 10 },
        m: { fix: 0 },
        s: { fix: 0 }
      });
    });
  });
});
