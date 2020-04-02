const sinon = require("sinon");
const { expect } = require("chai");

const { AsyncFilterStream } = require("../../../src/async/async-filter-stream.js");
const { toArray } = require("../test-utils.js");

describe("AsyncFilterStream Unit Tests", () => {
  describe("The async iterator function", () => {
    const VALUES = [1, 2, 3, 4, 5];

    it("should return an async iterator", () => {
      const stream = new AsyncFilterStream(VALUES, v => true);
      expect(stream).to.have.property(Symbol.asyncIterator);
    });

    it("when iterated on, should return the filtered elements", async () => {
      const func = sinon.stub();
      func.withArgs(2).returns(false);
      func.returns(true);

      const stream = new AsyncFilterStream(VALUES, func);
      const expected = [1, 3, 4, 5];
      expect(await toArray(stream)).to.deep.equal(expected);
      VALUES.forEach(value => expect(func.withArgs(value).calledOnce).to.be.true);
    });

    it("when the backing iterable is empty, should return an empty async iterator", async () => {
      const stream = new AsyncFilterStream([], v => true);
      expect(await toArray(stream)).to.be.empty;
    });
  });
});
