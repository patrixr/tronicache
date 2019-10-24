const { cached }  = require('..');
const { expect }  = require('chai');

const ref = () => ({});

describe('Cache', () => {

  before(() => {
    this.subject = cached({
      users: {
        getUserById: ref,
        notifications: {
          noCache: true,
          getNotification: ref
        }
      },
      messages: {
        noCache: true,
        getMessage: ref
      },
      posts: {
        timeout: 10,
        getPosts: ref,

        comments: {
          getComments: ref
        }
      },
      scope: {
        getSelf() { return this }
      }
    })
  });

  it ('does not cache for noCache namespaces', () => {
    const first   = this.subject.messages.getMessage();
    const second  = this.subject.messages.getMessage();

    expect(first).to.not.equal(second);
  });

  it ('caches by arguments', () => {
    const first   = this.subject.users.getUserById(1);
    const second  = this.subject.users.getUserById(2);
    const third   = this.subject.users.getUserById(1);
    const fourth  = this.subject.users.getUserById(2);

    expect(first).to.not.equal(second);
    expect(first).to.equal(third);
    expect(first).to.not.equal(fourth);
    expect(second).to.equal(fourth);
  });

  it('nested namespaces can have different configurations', () => {
    const first   = this.subject.users.notifications.getNotification();
    const second  = this.subject.users.notifications.getNotification();

    expect(first).to.not.equal(second);
  });

  it('supports timeouts', (done) => {
    const first   = this.subject.posts.getPosts();
    const second  = this.subject.posts.getPosts();

    expect(first).to.equal(second);

    setTimeout(() => {
      const third   = this.subject.posts.getPosts();
      const fourth  = this.subject.posts.getPosts();

      expect(first).to.not.equal(third);
      expect(first).to.not.equal(fourth);
      expect(third).to.equal(fourth);
      done();
    }, 11)
  });

  it('uses it\'s parent configuration by default', (done) => {
    const first   = this.subject.posts.comments.getComments();
    const second  = this.subject.posts.comments.getComments();

    expect(first).to.equal(second);

    setTimeout(() => {
      const third   = this.subject.posts.comments.getComments();
      const fourth  = this.subject.posts.comments.getComments();

      expect(first).to.not.equal(third);
      expect(first).to.not.equal(fourth);
      expect(third).to.equal(fourth);
      done();
    }, 11)
  });

  it('scopes nested namespaces to the root object', () => {
    expect(this.subject.scope.getSelf()).to.equal(this.subject);
  });

});