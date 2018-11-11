'use strict';

import assert from 'assert';
import util from '../src/util';

describe('util', function () {
  describe('unit', function () {
    describe('compare', function () {
      it('should identify a lower value', function () {
        assert.strictEqual(util.unit.compare('D', 'M'), 1);
      });
      it('should identify equal values', function () {
        assert.strictEqual(util.unit.compare('D', 'D'), 0);
      });
      it('should identify a higher value', function () {
        assert.strictEqual(util.unit.compare('W', 'D'), -1);
      });
    });
    describe('lower', function () {
      it('should return lower date parts', function () {
        assert.deepStrictEqual(util.unit.lower('D'), ['h', 'm', 's']);
      });
      it('should return empty array if lowest date part', function () {
        assert.deepStrictEqual(util.unit.lower('s'), []);
      });
    });
    describe('higher', function () {
      it('should return higher date parts', function () {
        assert.deepStrictEqual(util.unit.higher('D'), ['Y', 'M', 'W']);
      });
      it('should return empty array if highest date part', function () {
        assert.deepStrictEqual(util.unit.higher('Y'), []);
      });
    });
    describe('between', function () {
      it('should return in-between date parts', function () {
        assert.deepStrictEqual(util.unit.between('D', 's'), ['h', 'm']);
      });
      it('should return empty array if inputs are equal', function () {
        assert.deepStrictEqual(util.unit.between('D', 'D'), []);
      });
    });
  });

  describe('date', function () {
    describe('get', function () {
      it('should return date parts', function () {
        assert.strictEqual(util.date.get.D.W(new Date(2014, 1, 3)), 1);
        assert.strictEqual(util.date.get.D.W(new Date(2014, 1, 9)), 7);
        assert.strictEqual(util.date.get.W.Y(new Date(2018, 6, 1)), 26);
        assert.strictEqual(util.date.get.W.Y(new Date(2021, 0, 1)), 53);
      });
    });
  });

  describe('scope', function () {
    describe('#getDefault()', function () {
      it('should return default scope', function () {
        assert.strictEqual(util.scope.getDefault('D'), 'M');
      });
    });
    describe('#filter()', function () {
      it('should not allow lookup with invalid unit', function () {
        assert.throws(function () { util.scope.filter('X'); });
      });
      it('should return default scope when scope is missing or invalid', function () {
        assert.strictEqual(util.scope.filter('D'), 'M');
        assert.strictEqual(util.scope.filter('h', 'X'), 'D');
      });
      it('should return scope when valid', function () {
        assert.strictEqual(util.scope.filter('D', 'W'), 'W');
      });
    });
  });
});
