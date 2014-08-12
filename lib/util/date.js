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
      Y: function (date) {
        return date.getMonth() + 1;
      }
    },
    W: {
      E: function (date) {
        console.log('W/E start date', +date);
        return Math.ceil(date / 1000 / 60 / 60 / 24 / 7);
      },
      Y: function () {
        throw new Error('Week of year scope not yet implemented');
      },
      M: function () {
        throw new Error('Week of month scope not yet implemented');
      }
    },
    D: {
      E: function (date) {
        return Math.ceil(date / 1000 / 60 / 60 / 24);
      },
      Y: function (date) {
        var start = new Date(+date);
        return (date - start) / 60 / 60 / 24;
      },
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
