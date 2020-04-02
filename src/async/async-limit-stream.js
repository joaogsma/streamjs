const { AsyncStream } = require("./async-stream");

module.exports.AsyncLimitStream = class AsyncLimitStream extends AsyncStream {
  quantity;

  constructor(iterable, quantity) {
    super(iterable);
    if (quantity < 0) {
      throw new RangeError("Quantity must be greater than or equal to zero");
    }
    this.quantity = quantity;
  }

  async *[Symbol.asyncIterator]() {
    let yieldedSoFar = 0;
    for await (const element of this._srcIterable) {
      if (yieldedSoFar >= this.quantity) {
        break;
      }
      yield element;
      yieldedSoFar++;
    }
  }
}