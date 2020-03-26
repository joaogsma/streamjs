class Stream {
  _srcIterable;

  constructor(iterable) {
    if (!iterable[Symbol.iterator] instanceof Function) {
      throw new TypeError("Non-iterable object");
    }
    this._srcIterable = iterable;
  }

  *[Symbol.iterator]() {
    yield* this._srcIterable;
  }

  forEach(func) {
    for (const element of this) {
      func(element);
    }
  }

  find(predicate) {
    for (const element of this) {
      if (predicate(element)) {
        return element;
      }
    }
  }

  reduce(func, initialValue) {
    const iterator = this[Symbol.iterator];
    const firstElement = iterator.next();
    if (firstElement.done) {
      return { done: true };
    }

    let accumulator = initialValue ? func(initialValue, firstElement.value) : firstElement.value;
    let index = initialValue ? 0 : 1;
    for (const element of iterator) {
      accumulator = func(accumulator, element, index++);
    }
    return accumulator;
  }

  toArray() {
    return Array.from(this);
  }

  toMap(keyFunc, valueFunc) {
    const result = new Map();
    for (const elem of this) {
      result.set(keyFunc(elem), valueFunc(elem));
    }
    return result;
  }

  toSet() {
    return new Set(this);
  }
}

Stream.fromElements = function (...elements) {
  return new Stream(elements);
}

module.exports = Stream;

// In order to avoid circular dependencies, the following requires and methods need to be placed
// after the Stream class is defined and exported.
const MapStream = require("./map-stream");
const FilterStream = require("./filter-stream");
const FlatMapStream = require("./flat-map-stream");
const LimitStream = require("./limit-stream");

Stream.prototype.map = function (func) {
  return new MapStream(this, func);
}

Stream.prototype.filter = function (predicate) {
  return new FilterStream(this, predicate);
}

Stream.prototype.flatMap = function (func) {
  return new FlatMapStream(this, func);
}

Stream.prototype.limit = function (quantity) {
  return new LimitStream(this, quantity);
}