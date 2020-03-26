const Stream = require("./stream");

module.exports = class FlatMapStream extends Stream {
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