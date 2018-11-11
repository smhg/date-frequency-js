'use strict';

import 'babel-polyfill';
import assert from 'assert';
import createFrequency from '../src/frequency';
import moment from 'moment';
import { odd, even } from 'number-kind';
import leapYear from 'leap-year';

createFrequency.fn.odd = odd;
createFrequency.fn.even = even;
createFrequency.fn.leap = leapYear;

describe('Frequency', function () {
  describe('#()', function () {
    let f;
    it('should take date string notation', function () {
      f = createFrequency('FT9H');
      assert.strictEqual(f.getValue('h'), 9);

      f = createFrequency('F6D/W');
      assert.strictEqual(f.getValue('D', 'W'), 6);
    });

    it('should take date and time string notation', function () {
      f = createFrequency('F3D/WT10H0M0S');
      assert.strictEqual(f.getValue('D', 'week'), 3);
      assert.strictEqual(f.getValue('h'), 10);
      assert.strictEqual(f.getValue('minute'), 0);
      assert.strictEqual(f.getValue('s'), 0);
    });

    it('should detect invalid string notation', function () {
      assert.throws(function () {
        createFrequency('F9H');
      });

      assert.throws(function () {
        createFrequency('FT6D');
      });
    });

    it('should take set of rules', function () {
      f = createFrequency({ h: { fix: 9 } });
      assert.strictEqual(f.getValue('h'), 9);
    });
  });

  describe('#getValue()', function () {
    it('should return values set with on', function () {
      let f = createFrequency();

      f = f.on('hour', 10).on('minute', 30);
      assert.strictEqual(f.getValue('hour'), 10);
      assert.strictEqual(f.getValue('m', 'h'), 30);

      f = f.on('day', 3, 'week');
      assert.strictEqual(f.getValue('day', 'week'), 3);

      f = f.on('week', { fn: 'odd', scope: 'E' });
      assert.strictEqual(f.getValue('week', 'epoch'), 'odd');
    });
  });

  describe('#next()', function () {
    it('should use the current date as default', function () {
      const date = new Date();
      date.setMinutes(0);
      date.setSeconds(0);
      const twoHoursLater = new Date(+date);
      twoHoursLater.setHours(twoHoursLater.getHours() + 2);

      const f = createFrequency({ h: { fix: twoHoursLater.getHours() } });

      assert.strictEqual(f.next(date).toString(), twoHoursLater.toString());
    });

    it('should return a Date instance', function () {
      assert.strictEqual(typeof (createFrequency()).next(new Date(2013, 8, 2)).getTime, 'function');
    });

    it('should handle date', function () {
      let f = createFrequency();
      let start = new Date(2013, 8, 2);

      assert.deepStrictEqual(f.next(start).toString(), (new Date(2013, 8, 2)).toString());

      f = f.on('hour', 10); // each day at 10:00:00
      assert.deepStrictEqual(f.next(start).toString(), (new Date(2013, 8, 2, 10)).toString());

      f = f.on('hour', 0); // each day at 00:00:00
      assert.deepStrictEqual(f.next(start).toString(), (new Date(2013, 8, 2)).toString());
    });

    it('should handle date and time', function () {
      let f = createFrequency();
      let start = new Date(2013, 8, 2, 11, 10, 20);

      assert.strictEqual(f.next(start).toString(), (new Date(2013, 8, 2, 11, 10, 20)).toString());

      f = f.on('hour', 10); // each day at 10:00:00
      assert.strictEqual(f.next(start).toString(), (new Date(2013, 8, 3, 10)).toString());

      f = f.on('hour', 0); // each day at 00:00:00
      assert.strictEqual(f.next(start).toString(), (new Date(2013, 8, 3)).toString());
    });

    it('should return date if it matches', function () {
      let f = createFrequency();

      f = f.on('hour', 10).on('minute', 0).on('second', 0); // each day at 10:00:00
      assert.strictEqual(f.next(new Date(2013, 8, 2, 10)).toString(), (new Date(2013, 8, 2, 10)).toString());
    });

    it('should handle different rules', function () {
      let f = createFrequency();
      let start = new Date(2013, 6, 2);

      f = f.on('month', 8); // each August 1st at 00:00:00
      assert.strictEqual(f.next(start).toString(), (new Date(2013, 7, 1)).toString());
    });

    it('should increase parent of fix', function () {
      let f = createFrequency();
      let start = new Date(2013, 8, 2);

      f = f.on('month', 3); // each March 1st at 00:00:00
      assert.strictEqual(f.next(start).toString(), (new Date(2014, 2, 1)).toString());

      f = f.on('month', 3).on('minute', 30); // each March 1st every 30 minutes
      assert.strictEqual(f.next(start).toString(), (new Date(2014, 2, 1, 0, 30)).toString());
    });

    it('should handle DST', function () {
      let f = createFrequency();
      let start = new Date(2013, 8, 2);

      f = f.on('month', 11); // each November 1st at 00:00:00 (across DST)
      assert.strictEqual(f.next(start).toString(), (new Date(2013, 10, 1)).toString());
    });

    it('should handle different scope', function () {
      let f = createFrequency();
      let start = new Date(2013, 8, 2, 11, 10, 20);

      f = f.on('hour', 10).on('day', 3, 'week'); // each Wednesday at 10:00:00
      assert.deepStrictEqual(f.next(start).toString(), (new Date(2013, 8, 4, 10)).toString());
    });

    it('should work with string notation', function () {
      let f = createFrequency('F1D/WT15H45M');
      assert.deepStrictEqual(f.next(new Date(2014, 2, 10)), new Date(2014, 2, 10, 15, 45));
      assert.deepStrictEqual(f.next(new Date(2014, 2, 10, 15, 45, 1)), new Date(2014, 2, 10, 15, 45, 1));
      assert.deepStrictEqual(f.next(new Date(2014, 2, 10, 15, 46)), new Date(2014, 2, 17, 15, 45));

      f = createFrequency('FT15H45M');
      assert.deepStrictEqual(f.next(new Date(2014, 2, 10)), new Date(2014, 2, 10, 15, 45));
    });

    it('should work with string notation containing defaults', function () {
      let f = createFrequency('F1D/WT15H45M0S');
      assert.deepStrictEqual(f.next(new Date(2014, 2, 4)), new Date(2014, 2, 10, 15, 45));
    });

    it('should apply functions to units', function () {
      // odd and even
      let f = createFrequency('F(odd)W1D/WT15H45M0S'); // Mondays of odd weeks at 15:45:00
      assert.deepStrictEqual(
        f.next(new Date(2015, 3, 29)),
        new Date(2015, 4, 4, 15, 45)
      );
      assert.deepStrictEqual(
        f.next(new Date(2014, 7, 11)),
        new Date(2014, 7, 11, 15, 45)
      );

      assert.deepStrictEqual(
        (createFrequency('F(even)WT9H30M0S')) // Every day of even weeks at 9:30:00
          .next(new Date(2015, 4, 4)),
        new Date(2015, 4, 11, 9, 30)
      );

      assert.deepStrictEqual(
        createFrequency('F(even)W5D/WT13H0M0S') // Fridays of odd weeks at 13:00:00
          .next(new Date(2016, 1, 26, 12, 0, 0)), // date in even week
        new Date(2016, 1, 26, 13, 0, 0)
      );

      assert.deepStrictEqual(
        createFrequency('F(odd)W5D/WT13H0M0S') // Fridays of odd weeks at 13:00:00
          .next(new Date(2016, 1, 26, 13, 30, 0)), // date in even week
        new Date(2016, 2, 4, 13, 0, 0)
      );

      assert.deepStrictEqual(
        createFrequency('F(even)W5D/WT13H0M0S') // Fridays of even weeks at 13:00:00
          .next(new Date(2016, 1, 26, 13, 30, 0)), // date in even week
        new Date(2016, 2, 11, 13, 0, 0)
      );

      // weekend
      createFrequency.fn.weekend = function (weekday) {
        return weekday === 6 || weekday === 7;
      };
      f = createFrequency('F(weekend)D/WT12H0M0S'); // Weekends at 12:00:00
      assert.deepStrictEqual(f.next(new Date(2014, 7, 20)), new Date(2014, 7, 23, 12));

      // summer
      createFrequency.fn.inSummer = function (month) {
        return month === 7 || month === 8;
      };
      f = createFrequency('F(inSummer)M1DT0H0M0S'); // First day of "summer" months at midnight
      let date = new Date(2014, 0, 15);
      date = f.next(date);
      assert.deepStrictEqual(date, new Date(2014, 6, 1, 0, 0, 0));
      date = f.next(date.setDate(2));
      assert.deepStrictEqual(date, new Date(2014, 7, 1, 0, 0, 0));
      date = f.next(date.setDate(2));
      assert.deepStrictEqual(date, new Date(2015, 6, 1, 0, 0, 0));

      // first full week of the month
      createFrequency.fn.inFirstFullWeek = function (day, date) {
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        const firstMonday = ((8 - firstDay.getDay()) % 7) + 1; // day of the month of first monday

        return firstMonday <= day && day < firstMonday + 7;
      };

      f = createFrequency('F(inFirstFullWeek)DT0H0M0S');

      assert.deepStrictEqual(
        f.next(new Date(2018, 5, 1)),
        new Date(2018, 5, 4)
      );

      assert.deepStrictEqual(
        f.next(new Date(2018, 5, 4, 12)),
        new Date(2018, 5, 5)
      );
    });
  });

  describe('#between()', function () {
    let arr;
    let arrm;

    before(function () {
      // plain javascript
      let f = createFrequency();
      let start = new Date(2013, 8, 2);
      let end = new Date(2013, 8, 9);

      f = f.on('hour', 10).on('minute', 0).on('second', 0); // each day at 10:00:00
      arr = f.between(start, end);

      // with moment
      let fm = createFrequency();
      let startm = moment(new Date(2013, 8, 2));
      let endm = moment(new Date(2013, 8, 9));

      fm = fm.on('hour', 10).on('minute', 0).on('second', 0); // each day at 10:00:00
      arrm = fm.between(startm, endm);
    });

    it('should return an array of dates', function () {
      assert.strictEqual(arr.length, 7);
      assert.strictEqual(arrm.length, 7);
    });

    it('should have the first item match the frequency', function () {
      assert.deepStrictEqual(arr[0], new Date(2013, 8, 2, 10));
      assert.deepStrictEqual(arrm[0], new Date(2013, 8, 2, 10));
    });

    it('should have the last item match the frequency', function () {
      assert.deepStrictEqual(arr[6], new Date(2013, 8, 8, 10));
      assert.deepStrictEqual(arrm[6], new Date(2013, 8, 8, 10));
    });

    it('should return using string notation', function () {
      let f = createFrequency('F1D/WT15H45M0S');
      let dates = f.between(new Date(2014, 2, 10), new Date(2014, 2, 17));
      assert.strictEqual(dates.length, 1);
    });

    it('should return nothing using string notation', function () {
      let f = createFrequency('F1D/WT15H45M0S');
      let dates = f.between(new Date(2014, 2, 4), new Date(2014, 2, 10));
      assert.strictEqual(dates.length, 0);
    });
  });

  describe('#compare()', function () {
    it('should detect before', function () {
      let f = createFrequency('F1D/W');
      assert.ok(f.compare(createFrequency('F2D/W')) === -1);
    });

    it('should detect after', function () {
      let f = createFrequency('F2D/W');
      assert.ok(f.compare(createFrequency('F1D/W')) === 1);
    });

    it('should detect equal', function () {
      let f = createFrequency('F1D/W');
      assert.ok(f.compare(createFrequency('F1D/W')) === 0);
    });
  });

  describe('#toString()', function () {
    it('should output the same string passed to the constructor', function () {
      assert.strictEqual((createFrequency('FT15H45M')).toString(), 'FT15H45M');
      assert.strictEqual((createFrequency('F1D/WT15H45M')).toString(), 'F1D/WT15H45M');
      assert.strictEqual((createFrequency('F1D/WT15H45M0S')).toString(), 'F1D/WT15H45M0S');

      assert.strictEqual((createFrequency('F(leap)Y1D/WT15H45M0S')).toString(), 'F(leap)Y1D/WT15H45M0S');
      assert.strictEqual((createFrequency('F(odd)W1D/WT15H45M0S')).toString(), 'F(odd)W1D/WT15H45M0S');
    });

    it('should output rules set with on() to string notation', function () {
      let f = createFrequency();

      f = f.on('month', 2).on('hour', 10);
      assert.strictEqual(f.toString(), 'F2MT10H');
    });

    it('should output scope set with on() to string notation', function () {
      let f = createFrequency();

      f = f.on('day', 2, 'week').on('hour', 10);
      assert.strictEqual(f.toString(), 'F2D/WT10H');
    });

    it('should respect default unit order', function () {
      let f = createFrequency({ second: { fix: 0 } });

      f = f.on('minute', 0).on('hour', 10);
      assert.strictEqual(f.toString(), 'FT10H0M0S');
    });
  });
});
