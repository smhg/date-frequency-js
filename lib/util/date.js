function getIsoDay (date) {
  return (date.getDay() + 6) % 7 + 1;
}

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
    return new Date(+date);
  },
  getIsoDay: getIsoDay,
  toObject: function (date) {
    return {
      'Y': date.getFullYear(),
      'M': {
        'Y': date.getMonth()
      },
      'D': {
        'M': date.getDate(),
        'W': getIsoDay(date)
      },
      'h': {
        'D': date.getHours()
      },
      'm': {
        'h': date.getMinutes()
      },
      's': {
        'm': date.getSeconds()
      }
    };
  },
  fromObject: function (obj) {
    return new Date(obj.Y, obj.M.Y, obj.D.M, obj.h.D, obj.m.h, obj.s.m);
  },
  add: function (date, unit, value) {
    return util.modify(date, unit, value);
  },
  sub: function (date, unit, value) {
    return util.modify(date, unit, -value);
  },
  modify: function (date, unit, value) {
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
  }
};

module.exports = util;
