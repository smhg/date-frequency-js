[![browser support](https://ci.testling.com/smhg/date-frequency-js.png)](https://ci.testling.com/smhg/date-frequency)

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

### .on(unit, fix|options)
Add frequency rules by specifying a unit and a value to fix it to or an options object.
The options object can contain 3 properties: `fix`, `scope` and `fn`.
```javascript
frequency.on('hour', 10).on('minute', 0).on('second', 0);
// each day at 10:00:00

frequency.on('day', 6).on('m', 30).on('s', 0);
// each 30 minutes after the hour of the 6th day of each month

frequency.on('d', {fix: 7, scope: 'week'}).on('h', 0).on('m', 0).on('s', 0);
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

## Todo
* Enable filters (?) like *n* th ocurrence within scope (e.g. 2nd Thursday of month).
* Remove dependencies.
* Spend less time in loops.

## Development
* Install latest [node.js](http://nodejs.org/) version.
* `git clone https://github.com/smhg/date-frequency-js.git` to fetch source.
* `npm install` to install dependencies.
* `npm test` to run tests.

## License
The MIT License (MIT)

Copyright (c) [Sam Hauglustaine](https://github.com/smhg)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
