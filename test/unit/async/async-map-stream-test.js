import sinon from "sinon";
import chai from "chai";

import { AsyncMapStream } from "../../../src/async/internal.js";
import { toArray } from "../test-utils.js";

describe("AsyncMapStream Unit Tests", () => {
  describe("The async iterator function", () => {
    const VALUES = [1, 2, 3, 4, 5];

    it("should return an async iterator", () => {
      const stream = new AsyncMapStream(VALUES, x => x);
      chai.expect(stream).to.have.property(Symbol.asyncIterator);
    });

    it("when iterated on, should return the mapped elements", async () => {
      const func = sinon.spy();
      const stream = new AsyncMapStream(VALUES, func);
      await toArray(stream);
      VALUES.forEach(value => chai.expect(func.withArgs(value).calledOnce).to.be.true);
    });

    it("when the backing iterable is empty, should return an empty async iterator", async () => {
      const stream = new AsyncMapStream([], x => x);
      chai.expect(await toArray(stream)).to.be.empty;
    });
  });
});
