const Sinon = require("sinon");
const { expect } = require("chai");

const FlatMapStream = require("../src/flat-map-stream");

describe("A FlatMapStream", () => {
  it("should return the flat mapped elements when iterated on", () => {
    const values = [1, 2, 3, 4, 5];
    const func = Sinon.stub();
    func.callsFake(x => [-x, x]);

    const stream = new FlatMapStream(values, func);
    const expected = [-1, 1, -2, 2, -3, 3, -4, 4, -5, 5];
    expect([...stream]).to.deep.equal(expected);
    values.forEach(value => expect(func.withArgs(value).calledOnce).to.be.true);
  });

  it("should return the flat mapped elements when the input function returns an iterator", () => {
    const values = [1, 2, 3, 4, 5];
    const func = v => [-v, v][Symbol.iterator]();
    const stream = new FlatMapStream(values, func);
    const expected = [-1, 1, -2, 2, -3, 3, -4, 4, -5, 5];
    expect([...stream]).to.deep.equal(expected);
  });

  it("should return an iterator when iterated on", () => {
    const values = [1, 2, 3];
    const stream = new FlatMapStream(values, x => [-x, x]);
    expect(stream).to.have.property(Symbol.iterator);
  });

  it("should return an empty iterator when given an empty iterable", () => {
    const stream = new FlatMapStream([], x => [-x, x]);
    expect([...stream]).to.deep.equals([]);
  });
});
