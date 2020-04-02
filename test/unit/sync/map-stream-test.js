import sinon from "sinon";
import chai from "chai";

import { MapStream } from "../../../src/sync/internal.js";

describe("MapStream Unit Tests", () => {
  describe("The iterator function", () => {
    const VALUES = [1, 2, 3, 4, 5];

    it("should return an iterator", () => {
      const values = [1, 2, 3];
      const stream = new MapStream(values, x => x);
      chai.expect(stream).to.have.property(Symbol.iterator);
    });

    it("when iterated on, should return the mapped elements", () => {
      const func = sinon.spy();
      const stream = new MapStream(VALUES, func);
      [...stream];
      VALUES.forEach(value => chai.expect(func.withArgs(value).calledOnce).to.be.true);
    });

    it("when the backing iterable is empty, should return an empty iterator", () => {
      const stream = new MapStream([], x => x);
      chai.expect([...stream]).to.be.empty;
    });
  });
});
