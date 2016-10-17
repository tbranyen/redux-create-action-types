redux-create-action-types
-------------------------

Helps you create Redux action types, safely & easily

[![Build Status](https://travis-ci.org/tbranyen/redux-create-action-types.svg?branch=master)](https://travis-ci.org/tbranyen/redux-create-action-types)

## Motiviation

You write Redux boilerplate every-single-day and this sucks.

``` js
export FETCHING_RESOURCE_FRAMES = 'FETCHING_RESOURCE_FRAMES';
export FAILED_FETCHING_RESOURCE_FRAMES = 'FAILED_FETCHING_RESOURCE_FRAMES';
export FETCHED_RESOURCE_FRAMES = 'FETCHED_RESOURCE_FRAMES';
export FETCHING_RESOURCE_IMAGE = 'FETCHING_RESOURCE_IMAGE';
export FAILED_FETCHING_RESOURCE_IMAGE = 'FAILED_FETCHING_RESOURCE_IMAGE';
export FETCHED_RESOURCE_IMAGE = 'FETCHED_RESOURCE_IMAGE';
```

One of the interesting design decisions around Redux, to me, was that it used
plain strings as action type identifiers. This decision is not strictly
imposed, but it does offer good serialization/deserialization, visual clues,
and works very well inside `switch` statements which are a defining trait of
Redux reducers.

The downsides of strings are that they are completely freeform and not
validated in any way besides your unit tests. Nothing guarentees your types
will be unique (except for you and your well coordinated team), and this could
introduce very strange behavior in your reducers when two actions are
dispatched with the same type, but different action payloads. Lastly, they are
very tedious to write out. You typically want to export them with the same name
they represent, which incurs twice the typing. For instance: `export const
MY_ACTION_TYPE = 'MY_ACTION_TYPE'`

There are many common solutions to some of these problems, which I'll outline
below, but no solution (that I'm aware of) that provides the beneficial niche
features:

### [Symbols](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol)

Symbols are string-like objects in JavaScript that are guarenteed unique, work
well with `switch` statements, are easy to write, and can serialize to plain
text strings. They seem like the perfect & ideal match for this use case. While
they break down with the same limitations of strings in terms of verbosity,
they really break down when it comes to Redux middleware (logger needs a
special serializer) and with being able to playback your actions from a saved
session (no way to deserialize back into the correct Symbol).

### [keykey](https://github.com/jameswomack/keykey)

A Node module that helps with the tediousness of defining mirrored key/value
pairs on an object. It works really well, but suffers from not throwing during
development when you access non-existent keys.

## What this module does for you

- Provides a very clear way of definining multiple action types

- In development, will throw when accessing types that were not previously declared
- In development, will throw when using the same type more than once
- In development, will throw when assigning a non-string type
- In development, will throw when assigning anything to the types object

- In production, silences all errors and does nothing fancy other than a single
  loop that turns your strings into key/values on a plain object.

## How to use

Before using, you'll need to install via [npm](https://npmjs.com) or
[yarn](https://yarnpkg.com):

``` sh
# Sorry for the long names, but I was late to the party...
npm install redux-create-action-types
yarn install redux-create-action-types
```

Then you can import using ES Modules:

``` js
import createTypes from 'redux-create-action-types'
```

or CJS, if you like:

``` js
const createTypes = require('redux-create-action-types')
```

Now you can create your types objects:

``` js
const Types = createTypes(
  'FETCHING_RESOURCE',
  'FETCHED_RESOURCE',
  'FAILED_FETCHING_RESOURCE'
)
```

For all intents, it will return a plain object that looks like this:

``` js
{
  'FETCHING_RESOURCE': 'FETCHING_RESOURCE',
  'FETCHED_RESOURCE': 'FETCHED_RESOURCE',
  'FAILED_FETCHING_RESOURCE': 'FAILED_FETCHING_RESOURCE',
}
```

## Eliminate `undefined` types

The special features of this module are only noticeable during development. For
instance if you were writing a reducer and tried to access a type that was
never defined before:

``` js
// This would be defined in another file...
const Types = createTypes(
  'FETCHING_RESOURCE',
  'FETCHED_RESOURCE',
  'FAILED_FETCHING_RESOURCE'
)

// A typically reducer.
function resource(state = {}, action) {
  switch (action.type) {
    case Types.FETCHING_SOME_RESOURCE: {
      return Object.assign({}, state, action)
    }

    default: { return state }
  }
}
```

The above will throw an error in development, because you've tried to access a
property that was never defined. Had you not used this, it's possible for an
undefined type to match your case check and put your app into an inconsistent
state.

## Prevent duplicate values

While keykey and this module make it easy to keep your key and values
consistent, the same can not be said with simple objects. The following will
show how this module prevents duplicate values:

``` js
const Types = createTypes(
  "TYPE_ONE"
);

// Produces: { "TYPE_ONE": "TYPE_ONE" }
```

If you attempt to modify this value, not that you would, but mistakes happen:

``` js
Types.TYPE_ONE = 'TYPE_TWO';
```

This will immediately error in development, letting you know something tried to
assign to this object. Since this module uses a new JavaScript feature, called
proxies, it can prevent all property setting behind an exception being thrown.

Another way this prevents duplicates is through use of a global cache:

``` js
// In one file...
const Types = createTypes(
  "TYPE_ONE"
);

// In another file...
const Types = createTypes(
  "TYPE_ONE"
);
```

The above will error as you have already used a type, and the system will not
let you reuse it, since your actions are dispatched to all reducers.
