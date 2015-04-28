var assert = require('assert'),
  util  = require('../lib/util');

describe('util', function () {
  describe('unit', function () {
    describe('compare', function () {
      it('should identify a lower value', function () {
        assert.equal(util.unit.compare('D', 'M'), 1);
      });
      it('should identify equal values', function () {
        assert.equal(util.unit.compare('D', 'D'), 0);
      });
      it('should identify a higher value', function () {
        assert.equal(util.unit.compare('W', 'D'), -1);
      });
    });
    describe('lower', function () {
      it('should return lower date parts', function () {
        assert.deepEqual(util.unit.lower('D'), ['h', 'm', 's']);
      });
      it('should return empty array if lowest date part', function () {
        assert.deepEqual(util.unit.lower('s'), []);
      });
    });
    describe('higher', function () {
      it('should return higher date parts', function () {
        assert.deepEqual(util.unit.higher('D'), ['Y', 'M', 'W']);
      });
      it('should return empty array if highest date part', function () {
        assert.deepEqual(util.unit.higher('Y'), []);
      });
    });
    describe('between', function () {
      it('should return in-between date parts', function () {
        assert.deepEqual(util.unit.between('D', 's'), ['h', 'm']);
      });
      it('should return empty array if inputs are equal', function () {
        assert.deepEqual(util.unit.between('D', 'D'), []);
      });
    });
  });

  describe('date', function () {
    describe('get', function () {
      it('should return date parts', function () {
        assert.equal(util.date.get['D']['W'](new Date(2014, 1, 3)), 1);
        assert.equal(util.date.get['D']['W'](new Date(2014, 1, 9)), 7);
      });
    });
  });

  describe('scope', function () {
    describe('#getDefault()', function () {
      it('should return default scope', function () {
        assert.equal(util.scope.getDefault('D'), 'M');
      });
    });
    describe('#filter()', function () {
      it('should not allow lookup with invalid unit', function () {
        assert.throws(function () { util.scope.filter('X'); });
      });
      it('should return default scope when scope is missing or invalid', function () {
        assert.equal(util.scope.filter('D'), 'M');
        assert.equal(util.scope.filter('h', 'X'), 'D');
      });
      it('should return scope when valid', function () {
        assert.equal(util.scope.filter('D', 'W'), 'W');
      });
    });
  });
});