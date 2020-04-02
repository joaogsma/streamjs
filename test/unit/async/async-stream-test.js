import sinon from "sinon";
import chai from "chai";

import { AsyncStream, AsyncMapStream, AsyncFilterStream, AsyncFlatMapStream, AsyncLimitStream } from "../../../src/async/internal.js";
import { toArray } from "../test-utils.js";

describe("AsyncStream Unit Tests", async () => {
  const VALUES = [1, 2, 3, 4, 5];

  describe("The constructor", () => {
    it("when the parameter isn't an iterable, should throw TypeError", () => {
      chai.expect(() => new AsyncStream(1)).to.throw(TypeError);
      chai.expect(() => new AsyncStream({ foo: "bar" })).to.throw(TypeError);
    });
  });

  describe("Instance methods", () => {
    describe("The async iterator function", () => {
      it("should return an async iterator", () => {
        const stream = new AsyncStream(VALUES);
        chai.expect(stream).to.have.property(Symbol.asyncIterator);
      });

      it("when iterated on, should return the elements", async () => {
        const stream = new AsyncStream(VALUES);
        chai.expect(await toArray(stream)).to.deep.equal(VALUES);
      });

      it("when iterated on and the backing iterable is asynchronous, should return the elements", async () => {
        async function* generateValues() {
          yield* VALUES;
        }
        const stream = new AsyncStream(generateValues());
        chai.expect(await toArray(stream)).to.deep.equal(VALUES);
      });

      it("when the backing iterable is empty, should return an empty async iterator", async () => {
        const stream = new AsyncStream([]);
        chai.expect(await toArray(stream)).to.be.empty;
      });
    });

    describe("#forEach", () => {
      const func = sinon.stub();

      beforeEach(() => func.reset());

      it("should call the function for each element", async () => {
        const stream = new AsyncStream(VALUES);
        await stream.forEach(func);
        chai.expect(func.callCount).to.equal(5);
        VALUES.forEach((value, index) => chai.expect(func.calledWith(value, index)).to.be.true);
      });

      it("when the backing iterable is empty, should never call the function", async () => {
        const stream = new AsyncStream([]);
        await stream.forEach(func);
        chai.expect(func.notCalled).to.be.true;
      });
    });

    describe("#find", () => {
      const predicate = sinon.stub();

      beforeEach(() => predicate.reset());

      it("should return the first valid element", async () => {
        predicate.callsFake(value => value % 2 == 0);
        const stream = new AsyncStream(VALUES);
        chai.expect(await stream.find(predicate)).to.equal(2);
        chai.expect(predicate.callCount).to.equal(2);
        chai.expect(predicate.calledWith(VALUES[0], 0)).to.be.true;
        chai.expect(predicate.calledWith(VALUES[1], 1)).to.be.true;
      });

      it("when the backing iterable is empty, should return undefined", async () => {
        const stream = new AsyncStream([]);
        chai.expect(await stream.find(v => true)).to.be.undefined;
        chai.expect(predicate.notCalled).to.be.true;
      });
    });

    describe("#reduce", () => {
      const func = sinon.stub();

      beforeEach(() => func.reset());

      it("when there is no initial value, should reduce the elements", async () => {
        const expectedResults = [3, 6, 10, 15];
        func.withArgs(VALUES[0], VALUES[1], 1).returns(expectedResults[0]);
        func.withArgs(expectedResults[0], VALUES[2], 2).returns(expectedResults[1]);
        func.withArgs(expectedResults[1], VALUES[3], 3).returns(expectedResults[2]);
        func.withArgs(expectedResults[2], VALUES[4], 4).returns(expectedResults[3]);

        const stream = new AsyncStream(VALUES);

        chai.expect(await stream.reduce(func)).to.equal(expectedResults[3]);
        chai.expect(func.callCount).to.equal(4);
        chai.expect(func.calledWith(VALUES[0], VALUES[1], 1)).to.be.true;
        chai.expect(func.calledWith(expectedResults[0], VALUES[2], 2)).to.be.true;
        chai.expect(func.calledWith(expectedResults[1], VALUES[3], 3)).to.be.true;
        chai.expect(func.calledWith(expectedResults[2], VALUES[4], 4)).to.be.true;
      });

      it("when there is an initial value, should reduce the elements", async () => {
        const expectedResults = [0, 2, 5, 9, 14];
        const initialValue = -1;
        func.withArgs(initialValue, VALUES[0], 0).returns(expectedResults[0]);
        func.withArgs(expectedResults[0], VALUES[1], 1).returns(expectedResults[1])
        func.withArgs(expectedResults[1], VALUES[2], 2).returns(expectedResults[2]);
        func.withArgs(expectedResults[2], VALUES[3], 3).returns(expectedResults[3]);
        func.withArgs(expectedResults[3], VALUES[4], 4).returns(expectedResults[4]);

        const stream = new AsyncStream(VALUES);

        chai.expect(await stream.reduce(func, initialValue)).to.equal(expectedResults[4]);
        chai.expect(func.callCount).to.equal(5);
        chai.expect(func.calledWith(initialValue, VALUES[0], 0)).to.be.true;
        chai.expect(func.calledWith(expectedResults[0], VALUES[1], 1)).to.be.true;
        chai.expect(func.calledWith(expectedResults[1], VALUES[2], 2)).to.be.true;
        chai.expect(func.calledWith(expectedResults[2], VALUES[3], 3)).to.be.true;
        chai.expect(func.calledWith(expectedResults[3], VALUES[4], 4)).to.be.true;
      });

      it("when the backing iterable is empty and there is an initial value, should return the initial value", async () => {
        const initialValue = 2;
        const stream = new AsyncStream([]);
        chai.expect(await stream.reduce(func, initialValue)).to.equal(initialValue);
        chai.expect(func.notCalled).to.be.true;
      });

      it("when the backing iterable is empty and there is no initial value, should throw TypeError", async () => {
        const stream = new AsyncStream([]);
        await (async () => chai.expect(await stream.reduce(func)).to.throw(TypeError));
        chai.expect(func.notCalled).to.be.true;
      });
    });

    describe("#toArray", () => {
      it("should return an array with the elements", async () => {
        const stream = new AsyncStream(VALUES);
        chai.expect(await stream.toArray()).to.deep.equal(VALUES);
      });

      it("when the backing iterable is empty, should return an empty array", async () => {
        const stream = new AsyncStream([]);
        chai.expect(await stream.toArray()).to.be.empty;
      })
    });

    describe("#toMap", () => {
      const LOWERCASE_A_ASCII_CODE = 97;

      const keyFunction = sinon.stub();
      const valueFunction = sinon.stub();

      function defaultKeyFunction(x) {
        return x + LOWERCASE_A_ASCII_CODE;
      };

      function defaultValueFunction(x) {
        return String.fromCharCode(x + LOWERCASE_A_ASCII_CODE);
      }

      afterEach(() => {
        keyFunction.reset();
        valueFunction.reset();
      });

      it("should return a map with the elements", async () => {
        keyFunction.callsFake(defaultKeyFunction);
        valueFunction.callsFake(defaultValueFunction);

        const stream = new AsyncStream(VALUES);
        const expected = new Map()
          .set(98, "b")
          .set(99, "c")
          .set(100, "d")
          .set(101, "e")
          .set(102, "f");
        chai.expect(await stream.toMap(keyFunction, valueFunction)).to.deep.equal(expected);
        chai.expect(keyFunction.callCount).to.equal(5);
        chai.expect(valueFunction.callCount).to.equal(5);
        VALUES.forEach(value => {
          chai.expect(keyFunction.calledWith(value)).to.be.true;
          chai.expect(valueFunction.calledWith(value)).to.be.true;
        });
      });

      it("when there are repeated elements, should keep only the latest", async () => {
        const values = [...VALUES, 3, 2, 1];
        keyFunction.callsFake(defaultKeyFunction);
        valueFunction.callsFake(defaultValueFunction);

        [3, 2, 1].forEach(key => {
          valueFunction.withArgs(key).onFirstCall().returns(defaultValueFunction(key) + "1");
          valueFunction.withArgs(key).onSecondCall().returns(defaultValueFunction(key) + "2");
        });

        const stream = new AsyncStream(values);

        const expected = new Map()
          .set(98, "b2")
          .set(99, "c2")
          .set(100, "d2")
          .set(101, "e")
          .set(102, "f");

        chai.expect(await stream.toMap(keyFunction, valueFunction)).to.deep.equal(expected);
        chai.expect(keyFunction.callCount).to.equal(8);
        chai.expect(valueFunction.callCount).to.equal(8);
        values.forEach(value => {
          chai.expect(keyFunction.calledWith(value)).to.be.true;
          chai.expect(valueFunction.calledWith(value)).to.be.true;
        });
      });

      it("when the backing iterable is empty, should return an empty map", async () => {
        const stream = new AsyncStream([]);
        chai.expect(await stream.toMap(keyFunction, valueFunction)).to.be.empty;
        chai.expect(keyFunction.notCalled).to.be.true;
        chai.expect(valueFunction.notCalled).to.be.true;
      });

      it("when the key function parameter is not a function, should throw TypeError", async () => {
        const stream = new AsyncStream(VALUES);
        await (async () => chai.expect(await stream.toMap(1, valueFunction)).to.throw(TypeError));
        chai.expect(valueFunction.callCount).to.be.at.most(1);
      });

      it("when the key function parameter is not a function and the backing iterable is empty, should return empty map", async () => {
        const stream = new AsyncStream([]);
        chai.expect(await stream.toMap(1, valueFunction)).to.be.empty;
        chai.expect(valueFunction.notCalled).to.be.true;
      });

      it("when the value function parameter is not a function, should throw TypeError", async () => {
        const stream = new AsyncStream(VALUES);
        await (async () => chai.expect(await stream.toMap(keyFunction, 2)).to.throw(TypeError));
        chai.expect(keyFunction.callCount).to.be.at.most(1);
      });

      it("when the value function parameter is not a function and the backing iterable is empty, should return empty map", async () => {
        const stream = new AsyncStream([]);
        chai.expect(await stream.toMap(keyFunction, 2)).to.be.empty;
        chai.expect(keyFunction.notCalled).to.be.true;
      });
    });

    describe("#toSet", () => {
      it("should return a set with the elements", async () => {
        const stream = new AsyncStream(VALUES);
        chai.expect(await stream.toSet()).to.deep.equal(new Set(VALUES));
      });

      it("when the backing iterable is empty, should return an empty set", async () => {
        const stream = new AsyncStream([]);
        chai.expect(await stream.toSet()).to.be.empty;
      })
    });

    describe("#map", () => {
      it("should create a AsyncMapStream", () => {
        const stream = new AsyncStream(VALUES);
        const func = x => x + 1;
        const expected = new AsyncMapStream(stream, func);
        chai.expect(stream.map(func)).to.deep.equal(expected);
      });
    });

    describe("#filter", () => {
      it("should create an AsyncFilterStream", () => {
        const stream = new AsyncStream(VALUES);
        const predicate = x => true;
        const expected = new AsyncFilterStream(stream, predicate);
        chai.expect(stream.filter(predicate)).to.deep.equal(expected);
      });
    });

    describe("#flatMap", () => {
      it("should create a AsyncFlatMapStream", () => {
        const stream = new AsyncStream(VALUES);
        const func = x => [-x, x];
        const expected = new AsyncFlatMapStream(stream, func);
        chai.expect(stream.flatMap(func)).to.deep.equal(expected);
      });
    });

    describe("#limit", () => {
      it("should create a AsyncLimitStream", () => {
        const stream = new AsyncStream(VALUES);
        const quantity = 2;
        const expected = new AsyncLimitStream(stream, quantity);
        chai.expect(stream.limit(quantity)).to.deep.equal(expected);
      });
    });
  });

  describe("Static methods", () => {
    describe("#fromElements", () => {
      it("should create a stream aggregating the elements into an array", () => {
        const expected = new AsyncStream(VALUES);
        chai.expect(AsyncStream.fromElements(...VALUES)).to.deep.equal(expected);
      });
    });
  });
});
