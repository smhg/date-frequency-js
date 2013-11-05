var Frequency = require('../lib/frequency');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

module.exports = {
  constructor: function (test) {
    var f = new Frequency({ D: { fix: 3, scope: 'W' }, h: { fix: 9, scope: 'D' } }),
      start = new Date(2013, 9, 14);

    test.deepEqual(f.next(start), new Date(2013, 9, 16, 9, 0, 0), 'constructor should take set of rules');

    test.done();
  },
  getValue: function (test) {
    var f = new Frequency();

    f.on('hour', 10).on('minute', 0);

    test.equal(f.getValue('hour'), 10, 'getValue should return value set with on');
    test.equal(f.getValue('m', 'h'), 0, 'getValue with scope should return value set with on');

    test.done();
  },
  next: function (test) {
    var f = new Frequency(),
      start = new Date(2013, 8, 2);

    test.deepEqual(f.next(start), new Date(2013, 8, 2), 'empty frequency should return same date');

    f.on('hour', 10); // each day at 10:00:00
    test.deepEqual(f.next(start), new Date(2013, 8, 2, 10, 0, 0), 'next should return next instance of frequency');

    f.on('hour', 0); // each day at 00:00:00
    test.deepEqual(f.next(start), new Date(2013, 8, 2), 'next should return passed date if match');

    f.on('hour', 10).on('day', 3); // each Wednesday at 10:00:00
    test.deepEqual(f.next(start), new Date(2013, 8, 4, 10, 0, 0), 'multiple rules should return correct instance');

    f = new Frequency();
    start = new Date(2013, 8, 2, 11, 10, 20);

    test.deepEqual(f.next(start), new Date(2013, 8, 2, 11, 10, 20), 'empty frequency should return same date');

    f.on('hour', 10); // each day at 10:00:00
    test.deepEqual(f.next(start), new Date(2013, 8, 3, 10, 0, 0), 'next should return next instance of frequency');

    f.on('hour', 0); // each day at 00:00:00
    test.deepEqual(f.next(start), new Date(2013, 8, 3, 0, 0, 0), 'next should return passed date if match');

    f.on('hour', 10).on('day', 3); // each Wednesday at 10:00:00
    test.deepEqual(f.next(start), new Date(2013, 8, 4, 10, 0, 0), 'multiple rules should return correct instance');

    f = new Frequency();
    start = new Date(2013, 8, 2, 9, 54, 0);

    test.deepEqual(f.next(start), new Date(2013, 8, 2, 9, 54, 0), 'empty frequency should return same date');

    f.on('hour', 10); // each day at 10:00:00
    test.deepEqual(f.next(start), new Date(2013, 8, 2, 10, 0, 0), 'next should return next instance of frequency');

    f.on('hour', 0); // each day at 00:00:00
    test.deepEqual(f.next(start), new Date(2013, 8, 3, 0, 0, 0), 'next should return passed date if match');

    f.on('hour', 10).on('day', 3); // each Wednesday at 10:00:00
    test.deepEqual(f.next(start), new Date(2013, 8, 4, 10, 0, 0), 'multiple rules should return correct instance');

    f = new Frequency();
    start = new Date(2013, 8, 2);

    f.on('month', 10); // each November 1st at 00:00:00
    test.deepEqual(f.next(start), new Date(2013, 10, 1, 0, 0, 0), 'next should return next instance of frequency');

    f.on('month', 10).on('minute', 30); // each Wednesday at 10:00:00
    test.deepEqual(f.next(start), new Date(2013, 10, 1, 0, 30, 0), 'multiple rules should return correct instance');

    test.done();
  },
  between: function (test) {
    var f = new Frequency(),
      start = new Date(2013, 8, 2),
      end = new Date(2013, 8, 9);

    f.on('hour', 10).on('minute', 0).on('second', 0); // each day at 10:00:00
    var arr = f.between(start, end);

    test.equal(arr.length, 7, 'between should return an array of dates');
    test.deepEqual(arr[0], new Date(2013, 8, 2, 10, 0, 0), 'first item should be first frequency match');
    test.deepEqual(arr[6], new Date(2013, 8, 8, 10, 0, 0), 'last item should be last frequency match');

    test.done();
  },
  moment: function (test) {
    var moment = require('moment'),
      f = new Frequency(),
      start = moment(new Date(2013, 8, 2)),
      end = moment(new Date(2013, 8, 9));

    f.on('hour', 10).on('minute', 0).on('second', 0); // each day at 10:00:00
    var arr = f.between(start, end);

    test.equal(arr.length, 7, 'between should return an array of dates');
    test.deepEqual(arr[0], new Date(2013, 8, 2, 10, 0, 0), 'first item should be first frequency match');
    test.deepEqual(arr[6], new Date(2013, 8, 8, 10, 0, 0), 'last item should be last frequency match');

    test.done();
  }
};
