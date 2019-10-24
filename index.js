// --- Helpers

function isObject(obj) {
  return typeof obj === 'object';
}

function isFunction(fn) {
  return typeof fn === 'function';
}

function id(val) {
  return val;
}

function has(obj, prop) {
  return obj.hasOwnProperty(prop);
}

function populate(output) {
  return {
    from: (obj, cb) => {
      for (let key in obj) {
        if (has(obj, key)) {
          output[key] = cb(obj[key], key);
        }
      }
      return output;
    }
  }
}

// --- Cache

function usable(entry) {
  return entry && entry.expiry > Date.now();
}

function serialize(args) {
  return JSON.stringify(arguments)
}

function buildConfig(obj, config) {
  let opts = populate({}).from(config, id);
  if (has(obj, 'timeout')) { opts.timeout = obj.timeout }
  if (has(obj, 'cache')) { opts.cache = obj.cache }
  return opts;
}

// --- Entry point

function cached(obj, scope, parentConfig = {}, prefix = '') {
  const output  = {};
  const cache   = {};
  const config  = buildConfig(obj, parentConfig);
  const noCache = config.cache === false;
  const timeout = config.timeout || -1;

  scope = scope || output;

  const sig = (name) => `${prefix}:${name}`;

  const expiry = () => timeout < 0 ? Infinity : Date.now() + timeout;

  const newEntry = (value) => ({ expiry: expiry(), value:  value });

  const getCache = (sig) => {
    if (!cache[sig]) { cache[sig] = {} }
    return cache[sig];
  }

  const wrap = (fn, name) => {
    return (...args) => {
      const data      = getCache(sig(name));
      const cacheKey  = serialize(args);
      const entry     = data[cacheKey];

      if (usable(entry)) {
        return entry.value;
      }

      let value = fn.apply(scope, args);

      data[cacheKey] = newEntry(value);

      return value;
    }
  };

  return populate(output).from(obj, (val, key) => {
    if (isFunction(val)) {
      return noCache ? val : wrap(val, key);
    }
    if (isObject(val)) {
      return cached(val, scope, config, sig(key));
    }
    return val;
  });
}

module.exports = { cached };