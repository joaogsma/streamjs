const { expect } = require("chai");

const AsyncLimitStream = require("../src/async-limit-stream");
const { toArray } = require("./test-utils");

describe("A AsyncLimitStream", () => {
  it("should return the elements when iterated on", async () => {
    const values = [1, 2, 3, 4, 5];
    const stream = new AsyncLimitStream(values, 3);
    const expected = [1, 2, 3];
    expect(await toArray(stream)).to.deep.equal(expected);
  });

  it("should throw when the quantity is less than zero", () => {
    const values = [1, 2, 3, 4, 5];
    expect(() => new AsyncLimitStream(values, -2)).to.throw(RangeError);
  });

  it("should return an async iterator when iterated on", () => {
    const values = [1, 2, 3];
    const stream = new AsyncLimitStream(values, 3);
    expect(stream).to.have.property(Symbol.asyncIterator);
  });

  it("should return an empty async iterator when given an empty iterable", async () => {
    const stream = new AsyncLimitStream([], 3);
    expect(await toArray(stream)).to.be.empty;
  });
});
