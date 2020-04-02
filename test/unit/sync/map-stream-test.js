const sinon = require("sinon");
const { expect } = require("chai");

const { MapStream } = require("../../../src/sync/map-stream.js");

describe("MapStream Unit Tests", () => {
  describe("The iterator function", () => {
    const VALUES = [1, 2, 3, 4, 5];

    it("should return an iterator", () => {
      const values = [1, 2, 3];
      const stream = new MapStream(values, x => x);
      expect(stream).to.have.property(Symbol.iterator);
    });

    it("when iterated on, should return the mapped elements", () => {
      const func = sinon.spy();
      const stream = new MapStream(VALUES, func);
      [...stream];
      VALUES.forEach(value => expect(func.withArgs(value).calledOnce).to.be.true);
    });

    it("when the backing iterable is empty, should return an empty iterator", () => {
      const stream = new MapStream([], x => x);
      expect([...stream]).to.be.empty;
    });
  });
});
