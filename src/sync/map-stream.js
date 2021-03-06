import { Stream } from "./internal.js";

export class MapStream extends Stream {
  mapFunc;

  constructor(iterable, mapFunc) {
    super(iterable);
    this.mapFunc = mapFunc;
  }

  *[Symbol.iterator]() {
    let index = 0;
    for (const element of this._srcIterable) {
      yield this.mapFunc(element, index++);
    }
  }
}
