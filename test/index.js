const { deepEqual, throws, doesNotThrow } = require('assert');
const createTypes = require('../');

describe('createTypes', function() {
  afterEach(() => createTypes.clearGlobalCache());

  describe('in development', () => {
    beforeEach(() => process.env.NODE_ENV = 'test');

    it('will throw an error when no arguments are passed', () => {
      throws(() => createTypes());
    });

    it('will throw an error when a non-string argument is passed', () => {
      throws(() => createTypes({}));
    });

    it('will throw if you attempt to access a non-existent type', () => {
      const types = createTypes('Test');

      throws(() => {
        types.TEST;
      });
    });

    it('will throw if you assign a value to the types object', () => {
      const types = createTypes('Test');
      throws(() => types.TEST = 'test');
    });

    it('will throw if you reuse the same key twice', () => {
      createTypes('test');
      throws(() => createTypes('test'));
    });
  });

  describe('in production', () => {
    beforeEach(() => process.env.NODE_ENV = 'production');

    it('will not throw an error when no arguments are passed', () => {
      doesNotThrow(() => createTypes());
    });

    it('will not throw an error when a non-string argument is passed', () => {
      doesNotThrow(() => createTypes({}));
    });

    it('will not throw if you attempt to access a non-existent type', () => {
      const types = createTypes('Test');
      doesNotThrow(() => types.TEST);
    });

    it('will not throw if you assign a value to the types object', () => {
      const types = createTypes('Test');
      doesNotThrow(() => types.TEST = 'test');
    });

    it('will not throw if you reuse the same key twice', () => {
      createTypes('test');
      doesNotThrow(() => createTypes('test'));
    });
  });

  it('will return an object containing the type as key and value', () => {
    const actual = createTypes('test2');
    deepEqual(actual, { 'test2': 'test2' });
  });
});
