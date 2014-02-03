var assert = require('assert'),
  util  = require('../lib/util');

describe('util', function () {
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