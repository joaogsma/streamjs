class Stream {
  _srcIterable;

  constructor(iterable) {
    if (!this._isIterable(iterable)) {
      throw new TypeError("Non-iterable object");
    }
    this._srcIterable = iterable;
  }

  *[Symbol.iterator]() {
    yield* this._srcIterable;
  }

  forEach(func) {
    let index = 0;
    for (const element of this) {
      func(element, index++);
    }
  }

  find(predicate) {
    let index = 0;
    for (const element of this) {
      if (predicate(element, index++)) {
        return element;
      }
    }
  }

  reduce(func, initialValue) {
    const iterator = this[Symbol.iterator]();
    const firstElement = iterator.next();
    if (firstElement.done && !initialValue) {
      throw new TypeError("Reduce of empty stream with no initial value");
    }
    if (firstElement.done) {
      return initialValue;
    }

    let index = initialValue ? 0 : 1;
    let accumulator = initialValue
      ? func(initialValue, firstElement.value, index++)
      : firstElement.value;
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

  _isIterable(value) {
    return value instanceof Object
      && value[Symbol.iterator]
      && value[Symbol.iterator] instanceof Function;
  }
}

Stream.fromElements = function (...elements) {
  return new Stream(elements);
}

module.exports.Stream = Stream;

// In order to avoid circular dependencies, the following requires and methods need to be placed
// after the Stream class is defined and exported.
const mapStream = require("./map-stream");
const filterStream = require("./filter-stream");
const flatMapStream = require("./flat-map-stream");
const limitStream = require("./limit-stream");

Stream.prototype.map = function (func) {
  return new mapStream.MapStream(this, func);
}

Stream.prototype.filter = function (predicate) {
  return new filterStream.FilterStream(this, predicate);
}

Stream.prototype.flatMap = function (func) {
  return new flatMapStream.FlatMapStream(this, func);
}

Stream.prototype.limit = function (quantity) {
  return new limitStream.LimitStream(this, quantity);
}