const { expect } = require("chai");

const LimitStream = require("../src/limit-stream");

describe("A LimitStream", () => {
  it("should return the elements when iterated on", () => {
    const values = [1, 2, 3, 4, 5];
    const stream = new LimitStream(values, 3);
    const expected = [1, 2, 3];
    expect([...stream]).to.deep.equal(expected);
  });

  it("should throw when the quantity is less than zero", () => {
    const values = [1, 2, 3, 4, 5];
    expect(() => new LimitStream(values, -2)).to.throw(RangeError);
  });

  it("should return an iterator when iterated on", () => {
    const values = [1, 2, 3];
    const stream = new LimitStream(values, 3);
    expect(stream).to.have.property(Symbol.iterator);
  });

  it("should return an empty iterator when given an empty iterable", () => {
    const stream = new LimitStream([], 3);
    expect([...stream]).to.be.empty;
  });
});
