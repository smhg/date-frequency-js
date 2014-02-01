[![browser support](https://ci.testling.com/smhg/date-frequency.png)](http://ci.testling.com/smhg/date-frequency) [![Build status](https://api.travis-ci.org/smhg/date-frequency.png)](https://travis-ci.org/smhg/date-frequency)

frequency
===========
> Temporal frequency library

## Usage
```javascript
var frequency = new Frequency();

frequency.on('hour', 10)
  .on('minute', 30)
  .between(new Date(2013, 8, 2), new Date(2013, 8, 8, 23, 59, 0));

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
### .on(unit, fix, [of])
Add frequency rules by specifying a unit and a value to fix it to.
All units below the specified unit get fixed to the default (their value at the Unix epoch, 1970-01-01 00:00:00).
The optional `of` parameter allows you to change the scope of the unit. By default each unit's scope is the unit above it.

**Examples**
* `frequency.on('hour', 10);` sets the frequency to each day at 10:00:00.
* `frequency.on('day', 6).on('hour', 10).on('minute', 30);` sets the frequency to Saturdays at 12:30:00.
* `frequency.on('day', 10, 'month');` sets the frequency to the 10th day of the month at 00:00:00.

### .next(date)
Returns the next occurence of the frequency after the specified date.

### .between(start, end)
Returns all occurences of the frequency between (and including) the specified start and end date.

## Todo
* Add filters
  * odd/even (compared to reference date, e.g. Unix epoch)
  * *n*th ocurrence within scope (e.g. 2nd Thursday of the month)
* Remove dependencies

## Development
* Install latest [node.js](http://nodejs.org/) version.
* `git clone https://github.com/smhg/date-frequency.git` to fetch source.
* `npm install` to install dependencies.
* `npm test` to run tests.

## License
The MIT License (MIT)

Copyright (c) [Sam Hauglustaine](https://github.com/smhg)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
