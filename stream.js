class Stream {
  srcIterable;

  constructor(iterable) {
    this.srcIterable = iterable;
  }

  *[Symbol.iterator]() {
    yield* this.srcIterable;
  }

  map(func) {
    return new Stream(Stream.map(this, func));
  }

  filter(predicate) {
    return new Stream(Stream.filter(this, predicate));
  }

  flatMap(func) {
    return new Stream(Stream.flatMap(this, func));
  }

  limit(quantity) {
    return new Stream(Stream.limit(this, quantity));
  }

  forEach(func) {
    return new Stream(Stream.forEach(this, func));
  }

  find(predicate) {
    return new Stream(Stream.find(this, predicate));
  }

  reduce(func, initialValue) {
    return new Stream(Stream.reduce(this, func, initialValue));
  }
}

Stream.map = function* (iterable, func) {
  let index = 0;
  for(element of iterable) {
    yield func(element, index);
    index++;
  }
}

Stream.filter = function* (iterable, predicate) {
  let index = 0;
  for (element of iterable) {
    if (predicate(element, index)) {
      yield element;
    }
    index++;
  }
}

Stream.flatMap = function* (iterable, func) {
  let index = 0;
  for (element of iterable) {
    yield* func(element, index);
    index++;
  }
}

Stream.limit = function* (iterable, quantity) {
  let yieldedSoFar = 0;
  for (element of iterable) {
    yield element;
    yieldedSoFar++;
    if (yieldedSoFar === quantity) {
      break;
    }
  }
}

Stream.forEach = function (iterable, func) {
  for (element of iterable) {
    func(element);
  }
}

Stream.find = function (iterable, predicate) {
  for (element of iterable) {
    if (predicate(element)) {
      return element;
    }
  }
}

Stream.reduce = function (iterable, func, initialValue) {
  const firstElement = iterable.next();
  if (firstElement.done) {
    return { done: true };
  }

  let accumulator = initialValue ? func(initialValue, firstElement.value) : firstElement.value;
  let index = initialValue ? 0 : 1;
  for (element of iterable) {
    accumulator = func(accumulator, element, index);
    index++;
  }
  return accumulator;
}

module.exports = Stream;
