var modify = function (date, unit, value) {
  switch (unit) {
  case 'Y':
    date.setFullYear(date.getFullYear() + value);
    break;
  case 'M':
    date.setMonth(date.getMonth() + value);
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
    M: {
      Y: function (date) {
        return date.getMonth() + 1;
      }
    },
    W: {
    },
    D: {
      M: function (date) {
        return date.getDate();
      },
      W: function (date) {
        return (date.getDay() + 6) % 7 + 1;
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
