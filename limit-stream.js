const Stream = require("./stream");

module.exports = class LimitStream extends Stream {
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