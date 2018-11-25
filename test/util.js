'use strict';

import assert from 'assert';
import { compare, lower, higher, between } from '../src/util/unit';
import { get } from '../src/util/date';
import { getDefault, filter as filterScope } from '../src/util/scope';

describe('util', function () {
  describe('unit', function () {
    describe('compare', function () {
      it('should identify a lower value', function () {
        assert.strictEqual(compare('D', 'M'), 1);
      });
      it('should identify equal values', function () {
        assert.strictEqual(compare('D', 'D'), 0);
      });
      it('should identify a higher value', function () {
        assert.strictEqual(compare('W', 'D'), -1);
      });
    });
    describe('lower', function () {
      it('should return lower date parts', function () {
        assert.deepStrictEqual(lower('D'), ['h', 'm', 's']);
      });
      it('should return empty array if lowest date part', function () {
        assert.deepStrictEqual(lower('s'), []);
      });
    });
    describe('higher', function () {
      it('should return higher date parts', function () {
        assert.deepStrictEqual(higher('D'), ['Y', 'M', 'W']);
      });
      it('should return empty array if highest date part', function () {
        assert.deepStrictEqual(higher('Y'), []);
      });
    });
    describe('between', function () {
      it('should return in-between date parts', function () {
        assert.deepStrictEqual(between('D', 's'), ['h', 'm']);
      });
      it('should return empty array if inputs are equal', function () {
        assert.deepStrictEqual(between('D', 'D'), []);
      });
    });
  });

  describe('date', function () {
    describe('get', function () {
      it('should return date parts', function () {
        assert.strictEqual(get.D.W(new Date(2014, 1, 3)), 1);
        assert.strictEqual(get.D.W(new Date(2014, 1, 9)), 7);

        assert.strictEqual(get.W.Y(new Date(2018, 6, 1)), 26);
        assert.strictEqual(get.W.Y(new Date(2021, 0, 1)), 53);

        assert.strictEqual(get.W.E(new Date(1970, 0, 5)), 1);
        assert.strictEqual(get.W.E(new Date(1970, 0, 1)), 0);
        assert.strictEqual(get.W.E(new Date(1969, 11, 28, 23, 59, 59)), -1);
        assert.strictEqual(get.W.E(new Date(2018, 10, 14)), 2550);
      });
    });
  });

  describe('scope', function () {
    describe('#getDefault()', function () {
      it('should return default scope', function () {
        assert.strictEqual(getDefault('D'), 'M');
      });
    });
    describe('#filter()', function () {
      it('should not allow lookup with invalid unit', function () {
        assert.throws(function () { filterScope('X'); });
      });
      it('should return default scope when scope is missing or invalid', function () {
        assert.strictEqual(filterScope('D'), 'M');
        assert.strictEqual(filterScope('h', 'X'), 'D');
      });
      it('should return scope when valid', function () {
        assert.strictEqual(filterScope('D', 'W'), 'W');
      });
    });
  });
});
