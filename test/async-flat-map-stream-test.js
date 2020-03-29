const Sinon = require("sinon");
const { expect } = require("chai");

const AsyncFlatMapStream = require("../src/async-flat-map-stream");
const { toArray } = require("./test-utils");

describe("A AsyncFlatMapStream", () => {
  it("should return the flat mapped elements when iterated on", async () => {
    const values = [1, 2, 3, 4, 5];
    const func = Sinon.stub();
    func.callsFake(x => [-x, x]);

    const stream = new AsyncFlatMapStream(values, func);
    const expected = [-1, 1, -2, 2, -3, 3, -4, 4, -5, 5];
    expect(await toArray(stream)).to.deep.equal(expected);
    values.forEach(value => expect(func.withArgs(value).calledOnce).to.be.true);
  });

  it("should return the flat mapped elements when the input function returns an iterator", async () => {
    const values = [1, 2, 3, 4, 5];
    const func = v => [-v, v][Symbol.iterator]();
    const stream = new AsyncFlatMapStream(values, func);
    const expected = [-1, 1, -2, 2, -3, 3, -4, 4, -5, 5];
    expect(await toArray(stream)).to.deep.equal(expected);
  });

  it("should return an async iterator when iterated on", () => {
    const values = [1, 2, 3];
    const stream = new AsyncFlatMapStream(values, x => [-x, x]);
    expect(stream).to.have.property(Symbol.asyncIterator);
  });

  it("should return an empty async iterator when given an empty iterable", async () => {
    const stream = new AsyncFlatMapStream([], x => [-x, x]);
    expect(await toArray(stream)).to.be.empty;
  });
});
