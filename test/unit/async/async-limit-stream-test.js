import chai from "chai";

import { AsyncLimitStream } from "../../../src/async/internal.js";
import { toArray } from "../test-utils.js";

describe("AsyncLimitStream Unit Tests", () => {
  it("when the quantity is less than zero, should throw on construction", () => {
    const values = [1, 2, 3, 4, 5];
    chai.expect(() => new AsyncLimitStream(values, -2)).to.throw(RangeError);
  });

  describe("The async iterator function", () => {
    const VALUES = [1, 2, 3, 4, 5];

    it("should return an async iterator", () => {
      const stream = new AsyncLimitStream(VALUES, 3);
      chai.expect(stream).to.have.property(Symbol.asyncIterator);
    });

    it("when iterated on, should return the elements", async () => {
      const stream = new AsyncLimitStream(VALUES, 3);
      const expected = [1, 2, 3];
      chai.expect(await toArray(stream)).to.deep.equal(expected);
    });

    it("when the backing iterable is empty, should return an empty async iterator", async () => {
      const stream = new AsyncLimitStream([], 3);
      chai.expect(await toArray(stream)).to.be.empty;
    });
  });
});
