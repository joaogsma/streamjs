import { AsyncStream } from "./internal.js";

export class AsyncFlatMapStream extends AsyncStream {
  flatMapFunc;

  constructor(iterable, flatMapFunc) {
    super(iterable);
    this.flatMapFunc = flatMapFunc;
  }

  async *[Symbol.asyncIterator]() {
    let index = 0;
    for await (const element of this._srcIterable) {
      yield* this.flatMapFunc(element, index++);
    }
  }
}
