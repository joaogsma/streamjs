class AsyncStream {
  _srcIterable;

  constructor(iterable) {
    if (!iterable[Symbol.asyncIterator] instanceof Function) {
      throw new TypeError("Non-iterable object");
    }
    this._srcIterable = iterable;
  }

  async *[Symbol.asyncIterator]() {
    yield* this._srcIterator;
  }

  async forEach(func) {
    for await (const element of this) {
      func(element);
    }
  }

  async find(predicate) {
    for await (const element of this) {
      if (predicate(element)) {
        return element;
      }
    }
  }

  async reduce(func, initialValue) {
    const iterator = this[Symbol.asyncIterator];
    const firstElement = await iterator.next();
    if (firstElement.done) {
      return { done: true };
    }

    let accumulator = initialValue ? func(initialValue, firstElement.value) : firstElement.value;
    let index = initialValue ? 0 : 1;
    for await (const element of iterator) {
      accumulator = func(accumulator, element, index++);
    }
    return accumulator;
  }

  async toArray() {
    const result = [];
    for await (const elem of this._srcIterable) {
      result.push(elem);
    }
    return result;
  }

  async toMap(keyFunc, valueFunc) {
    const result = new Map();
    for await (const elem of this) {
      result.set(keyFunc(elem), valueFunc(elem));
    }
    return result;
  }

  async toSet() {
    const result = new Set();
    for await (const elem of this._srcIterable) {
      result.add(elem);
    }
    return result;
  }
}

module.exports = AsyncStream;

// In order to avoid circular dependencies, the following requires and methods need to be placed
// after the AsyncStream class is defined and exported.
const AsyncMapStream = require("./async-map-stream");
const AsyncFilterStream = require("./async-filter-stream");
const AsyncFlatMapStream = require("./async-flat-map-stream");
const AsyncLimitStream = require("./async-limit-stream");

AsyncStream.prototype.map = function (func) {
  return new AsyncMapStream(this, func);
}

AsyncStream.prototype.filter = function (predicate) {
  return new AsyncFilterStream(this, func);
}

AsyncStream.prototype.flatMap = function (func) {
  return new AsyncFlatMapStream(this, func);
}

AsyncStream.prototype.limit = function (quantity) {
  return new AsyncLimitStream(this, quantity);
}