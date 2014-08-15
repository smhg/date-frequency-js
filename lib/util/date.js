var epoch = new Date('0000-01-01T00:00:00'),
  weekday = function (date) {
      return (date.getDay() + 6) % 7 + 1;
    },
  day = 24 * 60 * 60 * 1000,
  week = 7 * day,
  firstWeekStart = +epoch + (8 - weekday(epoch)) * day;

var modify = function (date, unit, value) {
  switch (unit) {
  case 'Y':
    date.setFullYear(date.getFullYear() + value);
    break;
  case 'M':
    date.setMonth(date.getMonth() + value);
    break;
  case 'W':
    date.setDate(date.getDate() + value * 7);
    break;
  case 'D':
    date.setDate(date.getDate() + value);
    break;
  case 'h':
    date.setHours(date.getHours() + value);
    break;
  case 'm':
    date.setMinutes(date.getMinutes() + value);
    break;
  case 's':
    date.setSeconds(date.getSeconds() + value);
    break;
  }

  return date;
};

var util = {
  /**
   * Convert date-like objects to regular Date (adds support for moment)
   * @param Object|Date date
   * @return Date
   */
  convert: function (date) {
    if (typeof date.toDate === 'function') {
      return date.toDate();
    }
    return date;
  },
  clone: function (date) {
    return new Date(date.getTime());
  },
  get: {
    Y: {
      E: function (date) {
        return date.getFullYear();
      }
    },
    M: {
      E: function (date) {
        throw new Error('Scope not implemented: month of epoch');
      },
      Y: function (date) {
        return date.getMonth() + 1;
      }
    },
    W: {
      E: function (date) {
        return Math.floor((Math.abs(firstWeekStart) + +date) / week);
      },
      Y: function () {
        throw new Error('Scope not implemented: week of year');
      },
      M: function () {
        throw new Error('Scope not implemented: week of month');
      }
    },
    D: {
      E: function (date) {
        return Math.floor((Math.abs(epoch) + +date) / day);
      },
      Y: function (date) {
        return (+date - Date.UTC(date.getFullYear(), 0)) / day;
      },
      M: function (date) {
        return date.getDate();
      },
      W: function (date) {
        return weekday(date);
      }
    },
    h: {
      D: function (date) {
        return date.getHours();
      }
    },
    m: {
      h: function (date) {
        return date.getMinutes();
      }
    },
    s: {
      m:  function (date) {
        return date.getSeconds();
      }
    }
  },
  add: function (date, unit, value) {
    return modify(date, unit, value);
  },
  sub: function (date, unit, value) {
    return modify(date, unit, -value);
  }
};

module.exports = util;
