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
  'on': function (test) {
    var f = new Frequency(),
      tmp = f.on('hour', 10);

    test.deepEqual(f, tmp, 'on should be chainable');

    test.done();
  },
  'next': function (test) {
    var f = new Frequency(),
      start = new Date(2013, 8, 2);

    test.equal(f.next(start), new Date(2013, 8, 2, 0, 0, 1), 'default frequency should be 1 second');

    f.on('hour', 10); // each day at 10:00:00
    test.equal(f.next(start), new Date(2013, 8, 2, 10, 0, 0), 'next should return next instance of frequency');

    f.on('hour', 0); // each day at 00:00:00
    test.equal(f.next(start), start, 'next should include passed date as instance');

    f.on('hour', 10, 'month'); // each 10th hour of the month
    test.equal(f.next(start), new Date(2013, 9, 1, 10, 0, 0), 'scope change should return correct instance');

    f.on('hour', 10).on('day', 2); // each Wednesday at 10:00:00
    test.equal(f.next(start), new Date(2013, 9, 4, 10, 0, 0), 'multiple rules should return correct instance');

    test.done();
  },
  'between': function (test) {
    var f = new Frequency(),
      start = new Date(2013, 8, 2),
      end = new Date(2013, 8, 9);

    f.on('hour', 10); // each day at 10:00:00

    test.equal(f.between(start, end).length, 7, 'between should return an array of dates');

    test.done();
  }
};
