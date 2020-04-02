const { expect } = require("chai");
const sinon = require("sinon");

const { Stream } = require("../src/stream");
const { MapStream } = require("../src/map-stream");
const { FilterStream } = require("../src/filter-stream");
const { FlatMapStream } = require("../src/flat-map-stream");
const { LimitStream } = require("../src/limit-stream");

describe("Stream Unit Tests", () => {
  const VALUES = [1, 2, 3, 4, 5];

  describe("The constructor", () => {
    it("when the parameter isn't an iterable, should throw TypeError", () => {
      expect(() => new Stream(1)).to.throw(TypeError);
      expect(() => new Stream({ foo: "bar" })).to.throw(TypeError);
    });
  });

  describe("Instance methods", () => {
    describe("The iterator function", () => {
      it("should return an iterator", () => {
        const stream = new Stream(VALUES);
        expect(stream).to.have.property(Symbol.iterator);
      });

      it("when iterated on, should return the elements", () => {
        const stream = new Stream(VALUES);
        expect([...stream]).to.deep.equal(VALUES);
      });

      it("when the backing iterable is empty, should return an empty iterator", () => {
        const stream = new Stream([]);
        expect([...stream]).to.be.empty;
      });
    });

    describe("#forEach", () => {
      const func = sinon.stub();

      beforeEach(() => func.reset());

      it("should call the function for each element", () => {
        const stream = new Stream(VALUES);
        stream.forEach(func);
        expect(func.callCount).to.equal(5);
        VALUES.forEach((value, index) => expect(func.calledWith(value, index)).to.be.true);
      });

      it("when the backing iterable is empty, should never call the function", () => {
        const stream = new Stream([]);
        stream.forEach(func);
        expect(func.notCalled).to.be.true;
      });
    });

    describe("#find", () => {
      const predicate = sinon.stub();

      beforeEach(() => predicate.reset());

      it("should return the first valid element", () => {
        predicate.callsFake(value => value % 2 == 0);
        const stream = new Stream(VALUES);
        expect(stream.find(predicate)).to.equal(2);
        expect(predicate.callCount).to.equal(2);
        expect(predicate.calledWith(VALUES[0], 0)).to.be.true;
        expect(predicate.calledWith(VALUES[1], 1)).to.be.true;
      });

      it("when the backing iterable is empty, should return undefined", () => {
        const stream = new Stream([]);
        expect(stream.find(v => true)).to.be.undefined;
        expect(predicate.notCalled).to.be.true;
      });
    });

    describe("#reduce", () => {
      const func = sinon.stub();

      beforeEach(() => func.reset());

      it("when there is no initial value, should reduce the elements", () => {
        const expectedResults = [3, 6, 10, 15];
        func.withArgs(VALUES[0], VALUES[1], 1).returns(expectedResults[0]);
        func.withArgs(expectedResults[0], VALUES[2], 2).returns(expectedResults[1]);
        func.withArgs(expectedResults[1], VALUES[3], 3).returns(expectedResults[2]);
        func.withArgs(expectedResults[2], VALUES[4], 4).returns(expectedResults[3]);

        const stream = new Stream(VALUES);

        expect(stream.reduce(func)).to.equal(expectedResults[3]);
        expect(func.callCount).to.equal(4);
        expect(func.calledWith(VALUES[0], VALUES[1], 1)).to.be.true;
        expect(func.calledWith(expectedResults[0], VALUES[2], 2)).to.be.true;
        expect(func.calledWith(expectedResults[1], VALUES[3], 3)).to.be.true;
        expect(func.calledWith(expectedResults[2], VALUES[4], 4)).to.be.true;
      });

      it("when there is an initial value, should reduce the elements", () => {
        const expectedResults = [0, 2, 5, 9, 14];
        const initialValue = -1;
        func.withArgs(initialValue, VALUES[0], 0).returns(expectedResults[0]);
        func.withArgs(expectedResults[0], VALUES[1], 1).returns(expectedResults[1])
        func.withArgs(expectedResults[1], VALUES[2], 2).returns(expectedResults[2]);
        func.withArgs(expectedResults[2], VALUES[3], 3).returns(expectedResults[3]);
        func.withArgs(expectedResults[3], VALUES[4], 4).returns(expectedResults[4]);

        const stream = new Stream(VALUES);

        expect(stream.reduce(func, initialValue)).to.equal(expectedResults[4]);
        expect(func.callCount).to.equal(5);
        expect(func.calledWith(initialValue, VALUES[0], 0)).to.be.true;
        expect(func.calledWith(expectedResults[0], VALUES[1], 1)).to.be.true;
        expect(func.calledWith(expectedResults[1], VALUES[2], 2)).to.be.true;
        expect(func.calledWith(expectedResults[2], VALUES[3], 3)).to.be.true;
        expect(func.calledWith(expectedResults[3], VALUES[4], 4)).to.be.true;
      });

      it("when the backing iterable is empty and there is an initial value, should return the initial value", () => {
        const initialValue = 2;
        const stream = new Stream([]);
        expect(stream.reduce(func, initialValue)).to.equal(initialValue);
        expect(func.notCalled).to.be.true;
      });

      it("when the backing iterable is empty and there is no initial value, should throw TypeError", () => {
        const stream = new Stream([]);
        expect(() => stream.reduce(func)).to.throw(TypeError);
        expect(func.notCalled).to.be.true;
      });
    });

    describe("#toArray", () => {
      it("should return an array with the elements", () => {
        const stream = new Stream(VALUES);
        expect(stream.toArray()).to.deep.equal(VALUES);
      });

      it("when the backing iterable is empty, should return an empty array", () => {
        const stream = new Stream([]);
        expect(stream.toArray()).to.be.empty;
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

      it("should return a map with the elements", () => {
        keyFunction.callsFake(defaultKeyFunction);
        valueFunction.callsFake(defaultValueFunction);

        const stream = new Stream(VALUES);
        const expected = new Map()
          .set(98, "b")
          .set(99, "c")
          .set(100, "d")
          .set(101, "e")
          .set(102, "f");
        expect(stream.toMap(keyFunction, valueFunction)).to.deep.equal(expected);
        expect(keyFunction.callCount).to.equal(5);
        expect(valueFunction.callCount).to.equal(5);
        VALUES.forEach(value => {
          expect(keyFunction.calledWith(value)).to.be.true;
          expect(valueFunction.calledWith(value)).to.be.true;
        });
      });

      it("when there are repeated elements, should keep only the latest", () => {
        const values = [...VALUES, 3, 2, 1];
        keyFunction.callsFake(defaultKeyFunction);
        valueFunction.callsFake(defaultValueFunction);

        [3, 2, 1].forEach(key => {
          valueFunction.withArgs(key).onFirstCall().returns(defaultValueFunction(key) + "1");
          valueFunction.withArgs(key).onSecondCall().returns(defaultValueFunction(key) + "2");
        });

        const stream = new Stream(values);

        const expected = new Map()
          .set(98, "b2")
          .set(99, "c2")
          .set(100, "d2")
          .set(101, "e")
          .set(102, "f");

        expect(stream.toMap(keyFunction, valueFunction)).to.deep.equal(expected);
        expect(keyFunction.callCount).to.equal(8);
        expect(valueFunction.callCount).to.equal(8);
        values.forEach(value => {
          expect(keyFunction.calledWith(value)).to.be.true;
          expect(valueFunction.calledWith(value)).to.be.true;
        });
      });

      it("when the backing iterable is empty, should return an empty map", () => {
        const stream = new Stream([]);
        expect(stream.toMap(keyFunction, valueFunction)).to.be.empty;
        expect(keyFunction.notCalled).to.be.true;
        expect(valueFunction.notCalled).to.be.true;
      });

      it("when the key function parameter is not a function, should throw TypeError", () => {
        const stream = new Stream(VALUES);
        expect(() => stream.toMap(1, valueFunction)).to.throw(TypeError);
        expect(valueFunction.callCount).to.be.at.most(1);
      });

      it("when the key function parameter is not a function and the backing iterable is empty, should return empty map", () => {
        const stream = new Stream([]);
        expect(stream.toMap(1, valueFunction)).to.be.empty;
        expect(valueFunction.notCalled).to.be.true;
      });

      it("when the value function parameter is not a function, should throw TypeError", () => {
        const stream = new Stream(VALUES);
        expect(() => stream.toMap(keyFunction, 2)).to.throw(TypeError);
        expect(keyFunction.callCount).to.be.at.most(1);
      });

      it("when the value function parameter is not a function and the backing iterable is empty, should return empty map", () => {
        const stream = new Stream([]);
        expect(stream.toMap(keyFunction, 2)).to.be.empty;
        expect(keyFunction.notCalled).to.be.true;
      });
    });

    describe("#toSet", () => {
      it("should return a set with the elements", () => {
        const stream = new Stream(VALUES);
        expect(stream.toSet()).to.deep.equal(new Set(VALUES));
      });

      it("when the backing iterable is empty, should return an empty set", () => {
        const stream = new Stream([]);
        expect(stream.toSet()).to.be.empty;
      })
    });

    describe("#map", () => {
      it("should create a MapStream", () => {
        const stream = new Stream(VALUES);
        const func = x => x + 1;
        const expected = new MapStream(stream, func);
        expect(stream.map(func)).to.deep.equal(expected);
      });
    });

    describe("#filter", () => {
      it("should create a FilterStream", () => {
        const stream = new Stream(VALUES);
        const predicate = x => true;
        const expected = new FilterStream(stream, predicate);
        expect(stream.filter(predicate)).to.deep.equal(expected);
      });
    });

    describe("#flatMap", () => {
      it("should create a FlatMapStream", () => {
        const stream = new Stream(VALUES);
        const func = x => [-x, x];
        const expected = new FlatMapStream(stream, func);
        expect(stream.flatMap(func)).to.deep.equal(expected);
      });
    });

    describe("#limit", () => {
      it("should create a LimitStream", () => {
        const stream = new Stream(VALUES);
        const quantity = 2;
        const expected = new LimitStream(stream, quantity);
        expect(stream.limit(quantity)).to.deep.equal(expected);
      });
    });
  });

  describe("Static methods", () => {
    describe("#fromElements", () => {
      it("should create a stream aggregating the elements into an array", () => {
        const expected = new Stream(VALUES);
        expect(Stream.fromElements(...VALUES)).to.deep.equal(expected);
      });
    });
  });
});
