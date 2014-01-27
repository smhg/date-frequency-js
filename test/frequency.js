var assert = require('assert'),
  Frequency = require('../lib/frequency'),
  moment = require('moment');

describe('Frequency', function () {
  describe('#()', function () {
    it('should take set of rules', function () {
      var f = new Frequency({ D: { fix: 3, scope: 'W' }, h: { fix: 9, scope: 'D' } }),
        start = new Date(2013, 9, 14);

      assert.deepEqual(f.next(start), new Date(2013, 9, 16, 9, 0, 0));
    });
  });

  describe('#getValue()', function () {
    it('should return values set with on', function () {
      var f = new Frequency();

      f.on('hour', 10).on('minute', 0);

      assert.equal(f.getValue('hour'), 10);
      assert.equal(f.getValue('m', 'h'), 0);
    });
  });

  describe('#next()', function () {
    it('should handle date', function () {
      var f = new Frequency(),
        start = new Date(2013, 8, 2);

      assert.deepEqual(f.next(start), new Date(2013, 8, 2));

      f.on('hour', 10); // each day at 10:00:00
      assert.deepEqual(f.next(start), new Date(2013, 8, 2, 10, 0, 0));

      f.on('hour', 0); // each day at 00:00:00
      assert.deepEqual(f.next(start), new Date(2013, 8, 2));

      f.on('hour', 10).on('day', 3); // each Wednesday at 10:00:00
      assert.deepEqual(f.next(start), new Date(2013, 8, 4, 10, 0, 0));
    });

    it('should handle date and time', function () {
      var f = new Frequency(),
        start = new Date(2013, 8, 2, 11, 10, 20);

      assert.deepEqual(f.next(start), new Date(2013, 8, 2, 11, 10, 20));

      f.on('hour', 10); // each day at 10:00:00
      assert.deepEqual(f.next(start), new Date(2013, 8, 3, 10, 0, 0));

      f.on('hour', 0); // each day at 00:00:00
      assert.deepEqual(f.next(start), new Date(2013, 8, 3, 0, 0, 0));

      f.on('hour', 10).on('day', 3); // each Wednesday at 10:00:00
      assert.deepEqual(f.next(start), new Date(2013, 8, 4, 10, 0, 0));
    });

    it('should handle date with parts set to zero', function () {
      var f = new Frequency(),
        start = new Date(2013, 8, 2, 9, 54, 0);

      assert.deepEqual(f.next(start), new Date(2013, 8, 2, 9, 54, 0));

      f.on('hour', 10); // each day at 10:00:00
      assert.deepEqual(f.next(start), new Date(2013, 8, 2, 10, 0, 0));

      f.on('hour', 0); // each day at 00:00:00
      assert.deepEqual(f.next(start), new Date(2013, 8, 3, 0, 0, 0));

      f.on('hour', 10).on('day', 3); // each Wednesday at 10:00:00
      assert.deepEqual(f.next(start), new Date(2013, 8, 4, 10, 0, 0));
    });

    it('should handle different frequency parameters', function () {
      var f = new Frequency(),
        start = new Date(2013, 8, 2);

      f.on('month', 10); // each November 1st at 00:00:00
      assert.deepEqual(f.next(start), new Date(2013, 10, 1, 0, 0, 0));

      f.on('month', 10).on('minute', 30); // each Wednesday at 10:00:00
      assert.deepEqual(f.next(start), new Date(2013, 10, 1, 0, 30, 0));
    });
  });

  describe('#between()', function () {
    // plain javascript
    var f = new Frequency(),
      start = new Date(2013, 8, 2),
      end = new Date(2013, 8, 9);

    f.on('hour', 10).on('minute', 0).on('second', 0); // each day at 10:00:00
    var arr = f.between(start, end);

    // with moment
    var fm = new Frequency(),
      startm = moment(new Date(2013, 8, 2)),
      endm = moment(new Date(2013, 8, 9));

    fm.on('hour', 10).on('minute', 0).on('second', 0); // each day at 10:00:00
    var arrm = fm.between(startm, endm);

    it('should return an array of dates', function () {
      assert.equal(arr.length, 7);
      assert.equal(arrm.length, 7);
    });

    it('should have the first item match the frequency', function () {
      assert.deepEqual(arr[0], new Date(2013, 8, 2, 10, 0, 0));
      assert.deepEqual(arrm[0], new Date(2013, 8, 2, 10, 0, 0));
    });

    it('should have the last item match the frequency', function () {
      assert.deepEqual(arr[6], new Date(2013, 8, 8, 10, 0, 0));
      assert.deepEqual(arrm[6], new Date(2013, 8, 8, 10, 0, 0));
    });
  });
});
