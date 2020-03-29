const Sinon = require("sinon");
const { expect } = require("chai");

const AsyncMapStream = require("../src/async-map-stream");
const { toArray } = require("./test-utils");

describe("An AsyncMapStream", () => {
  it("should return the mapped elements when iterated on", async () => {
    const values = [1, 2, 3, 4, 5];
    const func = Sinon.spy();
    const stream = new AsyncMapStream(values, func);
    await toArray(stream);
    values.forEach(value => expect(func.withArgs(value).calledOnce).to.be.true);
  });

  it("should return an async iterator when iterated on", () => {
    const values = [1, 2, 3];
    const stream = new AsyncMapStream(values, x => x);
    expect(stream).to.have.property(Symbol.asyncIterator);
  });

  it("should return an empty async iterator when given an empty iterable", async () => {
    const stream = new AsyncMapStream([], x => x);
    expect(await toArray(stream)).to.be.empty;
  });
});
