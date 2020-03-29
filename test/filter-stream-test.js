const Sinon = require("sinon");
const { expect } = require("chai");

const FilterStream = require("../src/filter-stream");

describe("A FilterStream", () => {
  it("should return the filtered elements when iterated on", () => {
    const values = [1, 2, 3, 4, 5];
    const func = Sinon.stub();
    func.withArgs(2).returns(false);
    func.returns(true);

    const stream = new FilterStream(values, func);
    const expected = [1, 3, 4, 5];
    expect([...stream]).to.deep.equal(expected);
    values.forEach(value => expect(func.withArgs(value).calledOnce).to.be.true);
  });

  it("should return an iterator when iterated on", () => {
    const values = [1, 2, 3];
    const stream = new FilterStream(values, v => true);
    expect(stream).to.have.property(Symbol.iterator);
  });

  it("should return an empty iterator when given an empty iterable", () => {
    const stream = new FilterStream([], v => true);
    expect([...stream]).to.deep.equals([]);
  });
});
