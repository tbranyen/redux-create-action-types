(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ReactTypes = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
(function (global){
'use strict';

var GLOBAL_CACHE = new Set();
var hasProxy = typeof Proxy !== 'undefined';

// Creates type definitions that are immutable (frozen) and throw when
// properties are accessed that do not exist.
module.exports = function createTypes() {
  var glob = typeof window !== 'undefined' ? window : global;

  var _ref = glob['process'] ? glob['process'].env : {
    NODE_ENV: 'development'
  },
      NODE_ENV = _ref.NODE_ENV;

  var inProduction = NODE_ENV === 'production';

  // Will only error in development, not production.

  for (var _len = arguments.length, types = Array(_len), _key = 0; _key < _len; _key++) {
    types[_key] = arguments[_key];
  }

  if (!inProduction && types.length === 0) {
    throw new Error('Must specify at least one type');
  }

  // This is a proxy handler object that will be used in development to control
  // how the types object is used. This is not meant to limit the user, but to
  // empower them to write functional code.
  var handler = {
    get: function get(obj, key) {
      var val = obj[key];

      // Only deal with string access, no Symbols.
      if (inProduction || typeof key !== 'string') {
        return val;
      }

      // Inspect appears to be a Node property that is checked when you try
      // to log the object.
      if (key !== 'inspect' && !val) {
        throw new Error(key + ' is an invalid action type');
      }

      return val;
    }
  };

  // In production we do not want the performance bottleneck from the Proxy,
  // even if it's mostly negligible. If the user does not have a Proxy
  // implementation, default to plain object.
  var TYPES = inProduction || !hasProxy ? {} : new Proxy({}, handler);

  // Copy each type into the returned object and add into the global cache. If
  // we come across a duplicate, throw an error, but not in production.
  types.forEach(function (type) {
    if (!inProduction && GLOBAL_CACHE.has(type)) {
      throw new Error(type + ' has already been defined as an action type');
    }

    if (!inProduction && typeof type !== 'string') {
      throw new Error(type + ' is of an invalid type, expected string');
    }

    TYPES[type] = type;
    GLOBAL_CACHE.add(type);
  });

  // We set the `set` hook after we initially set our properties, this seals
  // the object in a way that `Object.freeze` cannot (unless the source code is
  // in strict mode, which is not a guarentee).
  handler.set = function (o, k) {
    throw new Error('Failed setting ' + k + ', object is frozen');
  };

  return TYPES;
};

// Allows the outside user to clear the global cache state.
module.exports.clearGlobalCache = function () {
  return GLOBAL_CACHE.clear();
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1])(1)
});