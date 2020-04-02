export class AsyncStream {
  _srcIterable;

  constructor(iterable) {
    if (!this._isIterable(iterable)) {
      throw new TypeError("Non-iterable object");
    }
    this._srcIterable = iterable;
  }

  async *[Symbol.asyncIterator]() {
    yield* this._srcIterable;
  }

  async forEach(func) {
    let index = 0;
    for await (const element of this) {
      func(element, index++);
    }
  }

  async find(predicate) {
    let index = 0;
    for await (const element of this) {
      if (predicate(element, index++)) {
        return element;
      }
    }
  }

  async reduce(func, initialValue) {
    const iterator = this[Symbol.asyncIterator]();
    const firstElement = await iterator.next();
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

  _isIterable(value) {
    return value instanceof Object
      && (this._isSyncIterable(value) || this._isAsyncIterable(value));
  }

  _isSyncIterable(value) {
    return value[Symbol.iterator] && value[Symbol.iterator] instanceof Function;
  }

  _isAsyncIterable(value) {
    return value[Symbol.asyncIterator] && value[Symbol.asyncIterator] instanceof Function;
  }
}

AsyncStream.fromElements = function (...elements) {
  return new AsyncStream(elements);
}

// In order to avoid circular dependencies, the following requires and methods need to be placed
// after the AsyncStream class is defined and exported.
import { AsyncMapStream, AsyncFilterStream, AsyncFlatMapStream, AsyncLimitStream } from "./internal.js";

AsyncStream.prototype.map = function (func) {
  return new AsyncMapStream(this, func);
}

AsyncStream.prototype.filter = function (predicate) {
  return new AsyncFilterStream(this, predicate);
}

AsyncStream.prototype.flatMap = function (func) {
  return new AsyncFlatMapStream(this, func);
}

AsyncStream.prototype.limit = function (quantity) {
  return new AsyncLimitStream(this, quantity);
}
