frequency [![Build status](https://api.travis-ci.org/smhg/date-frequency-js.png)](https://travis-ci.org/smhg/date-frequency-js)
=========
> Temporal frequency library

## Example
```javascript
var frequency = new Frequency();

frequency.on('hour', 10)
  .on('minute', 30)
  .on('second', 0)
  .between(new Date(2013, 8, 2), new Date(2013, 8, 8, 23, 59));

/*
  returns an array with these dates:
  2013-09-02 10:30:00
  2013-09-03 10:30:00
  2013-09-04 10:30:00
  2013-09-05 10:30:00
  2013-09-06 10:30:00
  2013-09-07 10:30:00
  2013-09-08 10:30:00
  */
```

## Methods
### Frequency()
Constructor takes a string notation (also see `toString()`).
```javascript
var frequency = Frequency('F3D/WT10H30M0S');
// every Wednesday at 10:30:00
```

### .on(unit, fix, scope)
Add frequency rules by specifying a unit and a value to fix it to and an optional scope.
The `fix` parameter can also be an object containing 3 properties: `fix`, `scope` and `fn`.
```javascript
frequency.on('hour', 10).on('minute', 0).on('second', 0);
// each day at 10:00:00

frequency.on('day', 6).on('m', 30).on('s', 0);
// each 30 minutes after the hour of the 6th day of each month

frequency.on('d', 7, 'week').on('h', 0).on('m', 0).on('s', 0);
// Sundays at midnight

Frequency.fn.even = require('number-kind').even;
frequency.on('week', {fn: 'even', scope: 'epoch'}).on('h', 0).on('m', 0).on('s', 0);
// days of even weeks at midnight
```

### .next(date)
Returns the next occurence of the frequency after the specified date.

### .between(start, end)
Returns all occurences of the frequency between (and including) the specified start and end date.

### .toString()
Returns a string notation of the frequency (useful for storage).

## Development
* Clone repo & `npm install`.
* Lint & test: `npm test`.
