import sinon from "sinon";
import chai from "chai";

import { AsyncFlatMapStream } from "../../../src/async/internal.js";
import { toArray } from "../test-utils.js";

describe("AsyncFlatMapStream Unit Tests", () => {
  describe("The async iterator function", () => {
    const VALUES = [1, 2, 3, 4, 5];

    it("should return an async iterator", () => {
      const stream = new AsyncFlatMapStream(VALUES, x => [-x, x]);
      chai.expect(stream).to.have.property(Symbol.asyncIterator);
    });

    it("when iterated on, should return the flat mapped elements", async () => {
      const func = sinon.stub();
      func.callsFake(x => [-x, x]);

      const stream = new AsyncFlatMapStream(VALUES, func);
      const expected = [-1, 1, -2, 2, -3, 3, -4, 4, -5, 5];
      chai.expect(await toArray(stream)).to.deep.equal(expected);
      VALUES.forEach(value => chai.expect(func.withArgs(value).calledOnce).to.be.true);
    });

    it("when the input function returns an iterator, should return the flat mapped elements", async () => {
      const func = v => [-v, v][Symbol.iterator]();
      const stream = new AsyncFlatMapStream(VALUES, func);
      const expected = [-1, 1, -2, 2, -3, 3, -4, 4, -5, 5];
      chai.expect(await toArray(stream)).to.deep.equal(expected);
    });

    it("when the backing iterable is empty, should return an empty async iterator", async () => {
      const stream = new AsyncFlatMapStream([], x => [-x, x]);
      chai.expect(await toArray(stream)).to.be.empty;
    });
  });
});
