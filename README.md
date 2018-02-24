frequency [![Build status](https://api.travis-ci.org/smhg/date-frequency-js.png)](https://travis-ci.org/smhg/date-frequency-js)
=========
> Temporal frequency library

## Installation
```sh
npm install --save date-frequency
```
If <=ES5 support is necessary, also install `babel-polyfill`.

## Usage
```javascript
createFrequency()
  .on('hour', 10)
  .on('minute', 30)
  .next(); // next occurence of 10:30

createFrequency()
  .on('day', 2, 'week')
  .next(); // next Tuesday

// all occurences of 10:00:00 in the next 5 days
const d = new Date();
createFrequency()
  .on('hour', 10)
  .on('m', 0)
  .on('s', 0)
  .between(d, (new Date(+d)).setDate(d.getDate() + 5));
```

## Methods
### createFrequency()
Constructor takes a string notation (also see `toString()`).
```javascript
createFrequency('F3D/WT10H30M0S');
// every Wednesday at 10:30:00
```

### .on(unit, fix[, scope])
Add frequency rules by specifying a unit and a value to fix it to and an optional scope.
The `fix` parameter can also be an object containing 3 properties: `fix`, `scope` and `fn`.
```javascript
frequency.on('hour', 10).on('minute', 0).on('second', 0);
// each day at 10:00:00

frequency.on('day', 6).on('m', 30);
// each 30 minutes after the hour of the 6th day of each month

frequency.on('d', 7, 'week');
// Sundays at midnight

Frequency.fn.even = require('number-kind').even;
frequency.on('week', {fn: 'even', scope: 'epoch'}).on('h', 0).on('m', 0).on('s', 0);
// days of even weeks at midnight
```

### .next(date)
Returns the next occurence of the frequency on or after the specified date. Please note that you are responsible for incrementing the date if you want to call `.next()` multiple times to get consecutive occurences.

### .between(start, end)
Returns all occurences of the frequency between (and including) the specified start and end date.

### .toString()
Returns a string notation of the frequency.

## Development
* Clone repo & `npm install`.
* Lint: `npm run lint`.
* Test: `npm test`.
