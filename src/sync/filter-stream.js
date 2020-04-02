import { Stream } from "./internal.js";

export class FilterStream extends Stream {
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
