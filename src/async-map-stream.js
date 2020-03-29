const AsyncStream = require("./async-stream");

module.exports = class AsyncMapStream extends AsyncStream {
  mapFunc;

  constructor(iterable, mapFunc) {
    super(iterable);
    this.mapFunc = mapFunc;
  }

  async *[Symbol.asyncIterator]() {
    let index = 0;
    for await (const element of this._srcIterable) {
      yield this.mapFunc(element, index++);
    }
  }
}