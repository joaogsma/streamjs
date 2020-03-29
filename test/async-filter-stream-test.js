const Sinon = require("sinon");
const { expect } = require("chai");

const AsyncFilterStream = require("../src/async-filter-stream");
const { toArray } = require("./test-utils");

describe("A AsyncFilterStream", () => {
  it("should return the filtered elements when iterated on", async () => {
    const values = [1, 2, 3, 4, 5];
    const func = Sinon.stub();
    func.withArgs(2).returns(false);
    func.returns(true);

    const stream = new AsyncFilterStream(values, func);
    const expected = [1, 3, 4, 5];
    expect(await toArray(stream)).to.deep.equal(expected);
    values.forEach(value => expect(func.withArgs(value).calledOnce).to.be.true);
  });

  it("should return an async iterator when iterated on", () => {
    const values = [1, 2, 3];
    const stream = new AsyncFilterStream(values, v => true);
    expect(stream).to.have.property(Symbol.asyncIterator);
  });

  it("should return an empty async iterator when given an empty iterable", async () => {
    const stream = new AsyncFilterStream([], v => true);
    expect(await toArray(stream)).to.be.empty;
  });
});
