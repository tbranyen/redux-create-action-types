const GLOBAL_CACHE = new Set();
const hasProxy = typeof Proxy !== 'undefined';

// Creates type definitions that are immutable (frozen) and throw when
// properties are accessed that do not exist.
module.exports = function createTypes(...types) {
  const glob = typeof window !== 'undefined' ? window : global;
  const { NODE_ENV } = glob['process'] ? glob['process'].env : {
    NODE_ENV: 'development',
  };
  const inProduction = NODE_ENV === 'production';

  // Will only error in development, not production.
  if (!inProduction && types.length === 0) {
    throw new Error('Must specify at least one type');
  }

  // This is a proxy handler object that will be used in development to control
  // how the types object is used. This is not meant to limit the user, but to
  // empower them to write functional code.
  const handler = {
    get(obj, key) {
      const val = obj[key];

      // Only deal with string access, no Symbols.
      if (inProduction || typeof key !== 'string') {
        return val;
      }

      // Inspect appears to be a Node property that is checked when you try
      // to log the object.
      if (key !== 'inspect' && !val) {
        throw new Error(`${key} is an invalid action type`);
      }

      return val;
    }
  };

  // In production we do not want the performance bottleneck from the Proxy,
  // even if it's mostly negligible. If the user does not have a Proxy
  // implementation, default to plain object.
  const TYPES = inProduction || !hasProxy ? {} : new Proxy({}, handler);

  // Copy each type into the returned object and add into the global cache. If
  // we come across a duplicate, throw an error, but not in production.
  types.forEach(type => {
    if (!inProduction && GLOBAL_CACHE.has(type)) {
      throw new Error(`${type} has already been defined as an action type`);
    }

    if (!inProduction && typeof type !== 'string') {
      throw new Error(`${type} is of an invalid type, expected string`);
    }

    TYPES[type] = type;
    GLOBAL_CACHE.add(type);
  });

  // We set the `set` hook after we initially set our properties, this seals
  // the object in a way that `Object.freeze` cannot (unless the source code is
  // in strict mode, which is not a guarentee).
  handler.set = (o, k) => {
    throw new Error(`Failed setting ${k}, object is frozen`);
  };

  return TYPES;
};

// Allows the outside user to clear the global cache state.
module.exports.clearGlobalCache = () => GLOBAL_CACHE.clear();
