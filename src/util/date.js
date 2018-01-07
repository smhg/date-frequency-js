'use strict';

const weekday = date => (date.getDay() + 6) % 7 + 1;

const epoch = new Date('0000-01-01T00:00:00');
const minute = 60 * 1000;
const day = 24 * 60 * minute;
const week = 7 * day;
const epochWeekday = weekday(epoch);
const firstWeekStart = +epoch + (epochWeekday === 1 ? 0 : 8 - epochWeekday) * day;

function modify (date, unit, value) {
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

const util = {
  /**
   * Convert date-like objects to regular Date (adds support for moment)
   * @param Object|Date date
   * @return Date
   */
  convert: date => typeof date.toDate === 'function' ? date.toDate() : date,
  clone: date => new Date(+date),
  get: {
    Y: {
      E: date => date.getFullYear()
    },
    M: {
      Y: date => date.getMonth() + 1
    },
    W: {
      E: date => Math.floor((Math.abs(firstWeekStart) + (+date) - date.getTimezoneOffset() * minute) / week)
    },
    D: {
      Y: date => (+date - Date.UTC(date.getFullYear(), 0)) / day,
      M: date => date.getDate(),
      W: date => weekday(date)
    },
    h: {
      D: date => date.getHours()
    },
    m: {
      h: date => date.getMinutes()
    },
    s: {
      m: date => date.getSeconds()
    }
  },
  getValue: function (unit, scope, value) {
    if (!util.get[unit]) {
      throw Error('Unit not implemented: ' + unit);
    }

    if (!util.get[unit][scope]) {
      throw Error('Scope not implemented: ' + unit + ' of ' + scope);
    }

    return util.get[unit][scope](value);
  },
  add: (date, unit, value) => modify(date, unit, value),
  sub: (date, unit, value) => modify(date, unit, -value)
};

export default util;
