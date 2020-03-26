const AsyncStream = require("./async-stream");

module.exports = class AsyncLimitStream extends AsyncStream {
  quantity;

  constructor(iterable, quantity) {
    super(iterable);
    this.quantity = quantity;
  }

  async *[Symbol.asyncIterator]() {
    let yieldedSoFar = 0;
    for await (const element of this._srcIterable) {
      yield element;
      yieldedSoFar++;
      if (yieldedSoFar === this.quantity) {
        break;
      }
    }
  }
}