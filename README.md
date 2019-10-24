# Tronicache

[![forthebadge](https://forthebadge.com/images/badges/made-with-javascript.svg)](https://forthebadge.com)

An argument-aware opinionated memcache

# Installation

```bash
npm install --save tronicache
```

# Usage

## Create a cached service

### Indefinite caching by default

```javascript
const { cached } = require('tronicache');

const service = cached({
  getUser(uid) {
    // cached indefinitely
  }
})
```

### Configurable timeout

```javascript
const { cached } = require('tronicache');

const service = cached({
  timeout: 2 * 60 * 6000, // all methods at the root are cached for 2 minutes

  getUser(uid) {
    // cached for 2 minutes
  }
})
```

### Nested namespace support

```javascript
const { cached } = require('tronicache');

const service = cached({
  users: {
    getUser(uid) {
      // cached indefinitely
    },

    posts: {
      // all methods within 'posts' will be cached for 2 minutes
      timeout: 2 * 60 * 1000,
      postsOfUser(uid) {
        const user = this.users.getUser(uid); // notice the scope
        // ...
      }
    }
  },
  notifications: {
    // nothing under 'notifications' is cached
    cache: false,
    fetch() {
      // ...
    },

    archive: {
      cache: true, // override in the subnamespace
      fetch() { }
    }
  }
});

```