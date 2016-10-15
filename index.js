const GLOBAL_CACHE = new Set();
const inProduction = process.env.NODE_ENV === 'production';

// Creates type definitions that are immutable (frozen) and throw when
// properties are accessed that do not exist.
module.exports = function createTypes(...types) {
  if (types.length === 0) {
    throw new Error('Must specify at least one type');
  }

  // In production we do not want the performance bottleneck from the Proxy,
  // even if it's mostly negligible.
  const TYPES = inProduction ? {} : new Proxy({}, {
    get: function(o, type) {
      if (typeof type === 'string' && type !== 'inspect'  && !o[type]) {
        throw new Error(`${type} is an invalid action type`);
      }

      return o[type];
    }
  });

  // Copy each type into the returned object and add into the global cache. If
  // we come across a duplicate, throw an error, but not in production.
  types.forEach(type => {
    if (!inProduction && GLOBAL_CACHE.has(type)) {
      throw new Error(`${type} has already been defined as an action type`);
    }

    if (typeof type !== 'string') {
      throw new Error(`${type} is of an invalid type, expected string`);
    }

    TYPES[type] = type;
    GLOBAL_CACHE.add(type);
  });

  return Object.freeze(TYPES);
};
