'use strict';

import assert from 'assert';
import parseRules from '../src/rule';

describe('Rule', function () {
  describe('parseRules()', function () {
    it('should recognize missing T', function () {
      const rules = parseRules('F(inThirdWeek)W3D/W');
      assert.deepStrictEqual(rules, {
        W: { Y: 'inThirdWeek' },
        D: { W: 3 }
      });
    });
    it('should not detect T in limit function', function () {
      const rules = parseRules('F(inThirdWeek)W3D/WT10H0M0S');
      assert.deepStrictEqual(rules, {
        W: { Y: 'inThirdWeek' },
        D: { W: 3 },
        h: { D: 10 },
        m: { h: 0 },
        s: { m: 0 }
      });
    });
    it('should recognize same-unit rules with different scope', function () {
      const rules = parseRules('F(even)D/M2D/WT12H0M0S');
      assert.deepStrictEqual(rules, {
        D: {
          M: 'even',
          W: 2
        },
        h: { D: 12 },
        m: { h: 0 },
        s: { m: 0 }
      });
    });
  });
});
