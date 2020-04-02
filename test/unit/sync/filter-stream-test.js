import sinon from "sinon";
import chai from "chai";

import { FilterStream } from "../../../src/sync/internal.js";

describe("FilterStream Unit Tests", () => {
  describe("The iterator function", () => {
    const VALUES = [1, 2, 3, 4, 5];

    it("should return an iterator", () => {
      const stream = new FilterStream(VALUES, v => true);
      chai.expect(stream).to.have.property(Symbol.iterator);
    });

    it("when iterated on, should return the filtered elements", () => {
      const func = sinon.stub();
      func.withArgs(2).returns(false);
      func.returns(true);

      const stream = new FilterStream(VALUES, func);
      const expected = [1, 3, 4, 5];
      chai.expect([...stream]).to.deep.equal(expected);
      VALUES.forEach(value => chai.expect(func.withArgs(value).calledOnce).to.be.true);
    });

    it("when the backing iterable is empty, should return an empty iterator", () => {
      const stream = new FilterStream([], v => true);
      chai.expect([...stream]).to.be.empty;
    });
  });
});
