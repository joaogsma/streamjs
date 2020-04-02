const { Stream } = require("./stream");

module.exports.LimitStream = class LimitStream extends Stream {
  quantity;

  constructor(iterable, quantity) {
    super(iterable);
    if (quantity < 0) {
      throw new RangeError("Quantity must be greater than or equal to zero");
    }
    this.quantity = quantity;
  }

  *[Symbol.iterator]() {
    let yieldedSoFar = 0;
    for (const element of this._srcIterable) {
      if (yieldedSoFar >= this.quantity) {
        break;
      }
      yield element;
      yieldedSoFar++;
    }
  }
}