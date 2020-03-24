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

  map(func) {
    return new MapStream(this, func);
  }

  filter(predicate) {
    return new FilterStream(this, predicate);
  }

  flatMap(func) {
    return new FlatMapStream(this, func);
  }

  limit(quantity) {
    return new LimitStream(this, quantity);
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

class MapStream extends Stream {
  mapFunc;

  constructor(iterable, mapFunc) {
    super(iterable);
    this.mapFunc = mapFunc;
  }

  *[Symbol.iterator]() {
    let index = 0;
    for (const element of this._srcIterable) {
      yield this.mapFunc(element, index++);
    }
  }
}

class FilterStream extends Stream {
  predicate;

  constructor(iterable, predicate) {
    super(iterable);
    this.predicate = predicate;
  }

  *[Symbol.iterator]() {
    let index = 0;
    for (const element of this._srcIterable) {
      if (this.predicate(element, index++)) {
        yield element;
      }
    }
  }
}

class FlatMapStream extends Stream {
  flatMapFunc;

  constructor(iterable, flatMapFunc) {
    super(iterable);
    this.flatMapFunc = flatMapFunc;
  }

  *[Symbol.iterator]() {
    let index = 0;
    for (const element of this._srcIterable) {
      yield* this.flatMapFunc(element, index++);
    }
  }
}

class LimitStream extends Stream {
  quantity;

  constructor(iterable, quantity) {
    super(iterable);
    this.quantity = quantity;
  }

  *[Symbol.iterator]() {
    let yieldedSoFar = 0;
    for (const element of this._srcIterable) {
      yield element;
      yieldedSoFar++;
      if (yieldedSoFar === this.quantity) {
        break;
      }
    }
  }
}

Stream.fromElements = function (...elements) {
  return new Stream(elements);
}

module.exports = Stream;
