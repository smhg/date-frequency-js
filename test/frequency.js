var assert = require('assert'),
  Frequency = require('../lib/frequency'),
  moment = require('moment');

Frequency.fn.odd = require('number-kind').odd;
Frequency.fn.leap = require('leap-year');

describe('Frequency', function () {
  describe('#()', function () {
    var f;
    it('should take date string notation', function () {
      f = new Frequency('FT9H');
      assert.equal(f.getValue('h'), 9);

      f = new Frequency('F6D/W');
      assert.equal(f.getValue('D', 'W'), 6);
    });

    it('should take date and time string notation', function () {
      f = new Frequency('F3D/WT10H0M0S');
      assert.equal(f.getValue('D', 'week'), 3);
      assert.equal(f.getValue('h'), 10);
      assert.equal(f.getValue('minute'), 0);
      assert.equal(f.getValue('s'), 0);
    });

    it('should detect invalid string notation', function () {
      assert.throws(function () {
        new Frequency('F9H');
      });

      assert.throws(function () {
        new Frequency('FT6D');
      });
    });

    it('should take set of rules', function () {
      f = new Frequency({h: {fix: 9}});
      assert.equal(f.getValue('h'), 9);
    });
  });

  describe('#getValue()', function () {
    it('should return values set with on', function () {
      var f = new Frequency();

      f.on('hour', 10).on('minute', 30);
      assert.equal(f.getValue('hour'), 10);
      assert.equal(f.getValue('m', 'h'), 30);

      f.on('day', 3, 'week');
      assert.equal(f.getValue('day', 'week'), 3);

      f.on('week', {fn: 'odd', scope: 'E'});
      assert.equal(f.getValue('week', 'epoch'), 'odd');
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

      assert.equal(f.next(start).toString(), new Date(2013, 8, 2, 11, 10, 20).toString());

      f.on('hour', 10); // each day at 10:00:00
      assert.equal(f.next(start).toString(), new Date(2013, 8, 3, 10).toString());

      f.on('hour', 0); // each day at 00:00:00
      assert.equal(f.next(start).toString(), new Date(2013, 8, 3).toString());
    });

    it('should return date if it matches', function () {
      var f = new Frequency();

      f.on('hour', 10).on('minute', 0).on('second', 0); // each day at 10:00:00
      assert.equal(f.next(new Date(2013, 8, 2, 10)).toString(), (new Date(2013, 8, 2, 10)).toString());
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

    it('should work with string notation', function () {
      var f = new Frequency('F1D/WT15H45M');
      assert.deepEqual(f.next(new Date(2014, 2, 10)), new Date(2014, 2, 10, 15, 45));

      assert.deepEqual(f.next(new Date(2014, 2, 10, 15, 45, 1)), new Date(2014, 2, 10, 15, 45, 1));

      assert.deepEqual(f.next(new Date(2014, 2, 10, 15, 46)), new Date(2014, 2, 17, 15, 45));
    });

    it('should work with string notation containing defaults', function () {
      var f = new Frequency('F1D/WT15H45M0S');
      assert.deepEqual(f.next(new Date(2014, 2, 4)), new Date(2014, 2, 10, 15, 45));
    });

    it('should apply functions to units', function () {
      var f = new Frequency('F(odd)W/E1D/WT15H45M0S'); // Mondays of odd weeks at 15:45:00
      assert.deepEqual(f.next(new Date(2014, 7, 6)), new Date(2014, 7, 11, 15, 45));
      assert.deepEqual(f.next(new Date(2014, 7, 11)), new Date(2014, 7, 11, 15, 45));

      Frequency.fn.weekend = function (weekday) {
          return weekday === 6 || weekday === 7;
        };
      var f = new Frequency('F(weekend)D/WT12H0M0S'); // Weekends at 12:00:00
      assert.deepEqual(f.next(new Date(2014, 7, 20)), new Date(2014, 7, 23, 12));

      Frequency.fn.inSummer = function (month) {
          return month === 7 || month === 8;
        };
      var f = new Frequency('F(inSummer)M1DT0H0M0S'); // First day of "summer" months at midnight
      var date = new Date(2014, 0, 15);
      date = f.next(date);
      assert.deepEqual(date, new Date(2014, 6, 1, 0, 0, 0));
      date = f.next(date.setDate(2));
      assert.deepEqual(date, new Date(2014, 7, 1, 0, 0, 0));
      date = f.next(date.setDate(2));
      assert.deepEqual(date, new Date(2015, 6, 1, 0, 0, 0));
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

    it('should return using string notation', function () {
      var f = new Frequency('F1D/WT15H45M0S');
      var dates = f.between(new Date(2014, 2, 10), new Date(2014, 02, 17));
      assert.equal(dates.length, 1);
    });

    it('should return nothing using string notation', function () {
      var f = new Frequency('F1D/WT15H45M0S');
      var dates = f.between(new Date(2014, 2, 4), new Date(2014, 2, 10));
      assert.equal(dates.length, 0);
    });
  });

  describe('#compare()', function () {
    it('should detect before', function () {
      var f = new Frequency('F1D/W');
      assert.ok(f.compare(new Frequency('F2D/W')) === -1);
    });

    it('should detect after', function () {
      var f = new Frequency('F2D/W');
      assert.ok(f.compare(new Frequency('F1D/W')) === 1);
    });

    it('should detect equal', function () {
      var f = new Frequency('F1D/W');
      assert.ok(f.compare(new Frequency('F1D/W')) === 0);
    });
  });

  describe('#toString()', function () {
    it('should output the same string passed to the constructor', function () {
      assert.equal((new Frequency('FT15H45M')).toString(), 'FT15H45M');
      assert.equal((new Frequency('F1D/WT15H45M')).toString(), 'F1D/WT15H45M');
      assert.equal((new Frequency('F1D/WT15H45M0S')).toString(), 'F1D/WT15H45M0S');

      assert.equal((new Frequency('F(leap)Y1D/WT15H45M0S')).toString(), 'F(leap)Y1D/WT15H45M0S');
      assert.equal((new Frequency('F(odd)W/E1D/WT15H45M0S')).toString(), 'F(odd)W/E1D/WT15H45M0S');
    });

    it('should output rules set with on() to string notation', function () {
      var f = new Frequency();

      f.on('month', 2).on('hour', 10);
      assert.equal(f.toString(), 'F2MT10H');
    });

    it('should output scope set with on() to string notation', function () {
      var f = new Frequency();

      f.on('day', 2, 'week').on('hour', 10);
      assert.equal(f.toString(), 'F2D/WT10H');
    });

    it('should respect default unit order', function () {
      var f = new Frequency({second: {fix: 0}});

      f.on('minute', 0).on('hour', 10);
      assert.equal(f.toString(), 'FT10H0M0S');
    });
  });
});
