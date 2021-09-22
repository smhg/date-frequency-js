frequency [![ci](https://github.com/smhg/date-frequency-js/actions/workflows/ci.yml/badge.svg)](https://github.com/smhg/date-frequency-js/actions/workflows/ci.yml)
=========
> Temporal frequency library

## Installation
```sh
npm install --save date-frequency
```

## Usage
```javascript
createFrequency()
  .on('hour', 10)
  .on('minute', 30)
  .next(); // next occurence of 10:30

// or, with a ISO-inspired string format
createFrequency('FT10M30')
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
Constructor takes a string notation or rules object.
```javascript
createFrequency('F3D/WT10H30M0S'); // every Wednesday at 10:30:00

// equals to:
createFrequency({D: {W: 3}, h: {D: 10}, m: {h: 30}, s: {m: 0}});
```

### .on(unit, value[, scope])
Add frequency rules by specifying a unit, a value to fix it to and, optionally, a scope.
```javascript
frequency.on('hour', 10).on('minute', 0).on('second', 0);
// each day at 10:00:00

frequency.on('day', 6).on('m', 30);
// each 30 minutes after the hour of the 6th day of each month

frequency.on('d', 7, 'week');
// Sundays at midnight
```

The value argument can also be a string which matches the name of a predefined function available in the `fn` property of the constructor.
```javascript
createFrequency.fn.even = require('number-kind').even;
createFrequency()
	.on('week', 'even', 'epoch')
	.on('h', 0)
	.on('m', 0)
	.on('s', 0);
// days of even weeks at midnight
```

### .next([date])
Returns the next occurence of the frequency after _or on_ the specified date. Please note that you are responsible for incrementing the date if you want to call `.next()` multiple times to get consecutive occurences.
If no date is specified, `new Date()` is used.

### .between(start, end)
Returns all occurences of the frequency between (and including) the specified start and end date.

### .toString()
Returns a string notation of the frequency.

## Development
* Clone repo & `npm install`.
* Lint: `npm run lint`.
* Test: `npm test`.
