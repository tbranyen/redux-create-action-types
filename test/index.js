const { deepEqual, throws } = require('assert');
const createTypes = require('../');

describe('createTypes', function() {
  it('will throw an error when no arguments are passed', () => {
    throws(() => {
      createTypes();
    });
  });

  it('will throw an error when a non-string argument is passed', () => {
    throws(() => {
      createTypes({});
    });
  });

  it('will throw if you attempt to access a non-existent type', () => {
    const types = createTypes('Test');

    throws(() => {
      types.TEST;
    });
  });

  it('will throw if you reuse the same key twice', () => {
    createTypes('test');

    throws(() => {
      createTypes('test');
    });
  });

  it('will return an object containing the type as key and value', () => {
    const actual = createTypes(
      'test2'
    );

    deepEqual(actual, {
      'test2': 'test2'
    });
  });
});
