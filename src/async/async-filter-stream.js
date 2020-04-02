import { AsyncStream } from "./internal.js";

export class AsyncFilterStream extends AsyncStream {
  predicate;

  constructor(iterable, predicate) {
    super(iterable);
    this.predicate = predicate;
  }

  async *[Symbol.asyncIterator]() {
    let index = 0;
    for await (const element of this._srcIterable) {
      if (this.predicate(element, index++)) {
        yield element;
      }
    }
  }
}
