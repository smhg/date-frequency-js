var assert = require('assert'),
  Frequency = require('../lib/frequency'),
  moment = require('moment');

describe('Frequency', function () {
  describe('#()', function () {
    it('should take string notation', function () {
      var f = new Frequency('FT9H');

      assert.equal(f.getValue('h'), 9);

      f = new Frequency('F6D/W');

      assert.equal(f.getValue('D', 'W'), 6);
    });

    it('should take set of rules', function () {
      var f = new Frequency({h: {fix: 9}});

      assert.equal(f.getValue('h'), 9);
    });
  });

  describe('#getValue()', function () {
    it('should return values set with on', function () {
      var f = new Frequency();

      f.on('hour', 10).on('minute', 30);

      assert.equal(f.getValue('hour'), 10);
      assert.equal(f.getValue('m', 'h'), 30);
    });
  });

  describe('#next()', function () {
    it('should return a Date instance', function () {
      assert.equal(typeof (new Frequency()).next(new Date(2013, 8, 2)).getTime, 'function');
    });

    it('should handle date', function () {
      var f = new Frequency(),
        start = new Date(2013, 8, 2);

      assert.deepEqual(f.next(start).toString(), new Date(2013, 8, 2).toString());

      f.on('hour', 10); // each day at 10:00:00
      assert.deepEqual(f.next(start).toString(), new Date(2013, 8, 2, 10).toString());

      f.on('hour', 0); // each day at 00:00:00
      assert.deepEqual(f.next(start).toString(), new Date(2013, 8, 2).toString());
    });

    it('should handle date and time', function () {
      var f = new Frequency(),
        start = new Date(2013, 8, 2, 11, 10, 20);

      assert.deepEqual(f.next(start).toString(), new Date(2013, 8, 2, 11, 10, 20).toString());

      f.on('hour', 10); // each day at 10:00:00
      assert.deepEqual(f.next(start).toString(), new Date(2013, 8, 3, 10).toString());

      f.on('hour', 0); // each day at 00:00:00
      assert.deepEqual(f.next(start).toString(), new Date(2013, 8, 3).toString());
    });

    it('should handle different rules', function () {
      var f = new Frequency(),
        start = new Date(2013, 6, 2);

      f.on('month', 8); // each August 1st at 00:00:00
      assert.equal(f.next(start).toString(), new Date(2013, 7, 1).toString());
    });

    it('should increase parent of fix', function () {
      var f = new Frequency(),
        start = new Date(2013, 8, 2);

      f.on('month', 3); // each March 1st at 00:00:00
      assert.equal(f.next(start).toString(), new Date(2014, 2, 1).toString());

      f.on('month', 3).on('minute', 30); // each March 1st every 30 minutes
      assert.equal(f.next(start).toString(), new Date(2014, 2, 1, 0, 30).toString());
    });

    it('should handle DST', function () {
      var f = new Frequency(),
        start = new Date(2013, 8, 2);

      f.on('month', 11); // each November 1st at 00:00:00 (across DST)
      assert.equal(f.next(start).toString(), new Date(2013, 10, 1).toString());
    });

    it('should handle different scope', function () {
      var f = new Frequency(),
        start = new Date(2013, 8, 2, 11, 10, 20);

      f.on('hour', 10).on('day', 3, 'week'); // each Wednesday at 10:00:00
      assert.deepEqual(f.next(start).toString(), new Date(2013, 8, 4, 10).toString());
    });
  });

  describe('#between()', function () {
    var arr, arrm;

    before(function () {
      // plain javascript
      var f = new Frequency(),
        start = new Date(2013, 8, 2),
        end = new Date(2013, 8, 9);

      f.on('hour', 10).on('minute', 0).on('second', 0); // each day at 10:00:00
      arr = f.between(start, end);

      // with moment
      var fm = new Frequency(),
        startm = moment(new Date(2013, 8, 2)),
        endm = moment(new Date(2013, 8, 9));

      fm.on('hour', 10).on('minute', 0).on('second', 0); // each day at 10:00:00
      arrm = fm.between(startm, endm);
    });

    it('should return an array of dates', function () {
      assert.equal(arr.length, 7);
      assert.equal(arrm.length, 7);
    });

    it('should have the first item match the frequency', function () {
      assert.deepEqual(arr[0], new Date(2013, 8, 2, 10));
      assert.deepEqual(arrm[0], new Date(2013, 8, 2, 10));
    });

    it('should have the last item match the frequency', function () {
      assert.deepEqual(arr[6], new Date(2013, 8, 8, 10));
      assert.deepEqual(arrm[6], new Date(2013, 8, 8, 10));
    });
  });

  describe('#toString()', function () {
    it('should return frequency string notation', function () {
      var f = new Frequency();

      f.on('month', 2).on('hour', 10);
      assert.equal(f.toString(), 'F2MT10H');
    });

    it('should include scope in notation', function () {
      var f = new Frequency();

      f.on('day', 2, 'week').on('hour', 10);
      assert.equal(f.toString(), 'F2D/WT10H');
    });
  });
});
