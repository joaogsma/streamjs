const Sinon = require("sinon");
const { expect } = require("chai");

const MapStream = require("../src/map-stream");

describe("A MapStream", () => {
  it("should return the mapped elements when iterated on", () => {
    const values = [1, 2, 3, 4, 5];
    const func = Sinon.spy();
    const stream = new MapStream(values, func);
    [...stream];
    values.forEach(value => expect(func.withArgs(value).calledOnce).to.be.true);
  });

  it("should return an iterator when iterated on", () => {
    const values = [1, 2, 3];
    const stream = new MapStream(values, x => x);
    expect(stream).to.have.property(Symbol.iterator);
  });

  it("should return an empty iterator when given an empty iterable", () => {
    const stream = new MapStream([], x => x);
    expect([...stream]).to.be.empty;
  });
});
