# Tronicache

[![forthebadge](https://forthebadge.com/images/badges/made-with-javascript.svg)](https://forthebadge.com)

An argument-aware opinionated memcache

# Installation

```bash
npm install --save tronicache
```

# Usage

Create your service

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
    noCache: true,
    fetch() {
      // ...
    },

    archive: {
      noCache: false, // override in the subnamespace
      fetch() { }
    }
  }
});

```