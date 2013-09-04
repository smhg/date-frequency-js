function Frequency () {

}

Frequency.prototype.on = function () {
  return this;
};

Frequency.prototype.next = function (date) {
  return date;
};

Frequency.prototype.between = function (start, end) {
  return [start, end];
};

module.exports = Frequency;
