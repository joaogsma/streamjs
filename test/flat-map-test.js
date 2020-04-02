const sinon = require("sinon");
const { expect } = require("chai");

const { FlatMapStream } = require("../src/flat-map-stream");

describe("FlatMapStream Unit Tests", () => {
  describe("The iterator function", () => {
    const VALUES = [1, 2, 3, 4, 5];

    it("should return an iterator", () => {
      const stream = new FlatMapStream(VALUES, x => [-x, x]);
      expect(stream).to.have.property(Symbol.iterator);
    });

    it("when iterated on, should return the flat mapped elements", () => {
      const func = sinon.stub();
      func.callsFake(x => [-x, x]);

      const stream = new FlatMapStream(VALUES, func);
      const expected = [-1, 1, -2, 2, -3, 3, -4, 4, -5, 5];
      expect([...stream]).to.deep.equal(expected);
      VALUES.forEach(value => expect(func.withArgs(value).calledOnce).to.be.true);
    });

    it("when the input function returns an iterator, should return the flat mapped elements", () => {
      const func = v => [-v, v][Symbol.iterator]();
      const stream = new FlatMapStream(VALUES, func);
      const expected = [-1, 1, -2, 2, -3, 3, -4, 4, -5, 5];
      expect([...stream]).to.deep.equal(expected);
    });

    it("when the backing iterable is empty, should return an empty iterator", () => {
      const stream = new FlatMapStream([], x => [-x, x]);
      expect([...stream]).to.be.empty;
    });
  });
});
