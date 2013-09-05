frequency
===========

Temporal frequency library

## Usage
```javascript
var frequency = new Frequency();

frequency.on('hour', 10)
  .on('minute', 30)
  .between(new Date(2013, 8, 2), new Date(2013, 8, 8, 23, 59, 00));

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

## Development
* Install latest [node.js](http://nodejs.org/) version.
* `git clone https://github.com/smhg/frequency.git` to fetch source.
* `npm install` to install dependencies.
* `grunt watch` to start a watch process for file changes. Each change triggers jshint and nodeunit.
