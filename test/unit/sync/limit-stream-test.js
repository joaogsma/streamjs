const { expect } = require("chai");

const { LimitStream } = require("../../../src/sync/limit-stream.js");

describe("LimitStream Unit Tests", () => {
  const VALUES = [1, 2, 3, 4, 5];
  it("when the quantity is less than zero, should throw on construction", () => {
    expect(() => new LimitStream(VALUES, -2)).to.throw(RangeError);
  });

  describe("The iterator function", () => {
    it("should return an iterator", () => {
      const values = [1, 2, 3];
      const stream = new LimitStream(values, 3);
      expect(stream).to.have.property(Symbol.iterator);
    });

    it("when iterated on, should return the elements", () => {
      const values = [1, 2, 3, 4, 5];
      const stream = new LimitStream(values, 3);
      const expected = [1, 2, 3];
      expect([...stream]).to.deep.equal(expected);
    });

    it("when the backing iterable is empty, should return an empty iterator", () => {
      const stream = new LimitStream([], 3);
      expect([...stream]).to.be.empty;
    });
  });
});
