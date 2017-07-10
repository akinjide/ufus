"use strict";

const assert = require('assert')

const RedisModel = require('../lib/redis')
const env = require('../config/env')
const conf = require('../lib/conf')(env)

describe('Unit :', () => {
  let fakeredis, redis, prefix, long_url, short_url

  describe('Redis', () => {
    beforeEach(() => {
      fakeredis = require('fakeredis').createClient(0, 'localhost', { fast: true })
      redis = new RedisModel(null, fakeredis)
      prefix = RedisModel._prefix
      long_url = 'https://www.apple.com'
      short_url = 'oly8'
    })

    it('kCounter should return a key', done => {
      assert.equal(redis.kCounter(), prefix + 'counter')
      done()
    })

    it('kUrl should return a key with hash', done => {
      assert.equal(redis.kUrl(long_url), prefix + 'url:82cc5b2a23492c33d2115e3a27bfcbec')
      done()
    })

    it('kHash should return a key with hash', done => {
      assert.equal(redis.kHash(short_url), prefix + 'hash:' + short_url)
      done()
    })

    it('md5 should return a md5 hash', done => {
      assert.equal(redis.md5(long_url), '82cc5b2a23492c33d2115e3a27bfcbec')
      done()
    })

    it('uniqId should return a unique key', done => {
      redis.uniqId((err, hash) => {
        assert.equal(hash.length, 4)
        assert.ok(hash, /[\w=]+/)
        done()
      })
    })

    it('queryUrl should return stored value', done => {
      fakeredis.multi([
        ['set', redis.kUrl(long_url), short_url],
        ['hmset', redis.kHash(short_url),
          'url', long_url,
          'hash', short_url
        ]
      ])
      .exec((err, replies) => {
        redis.queryUrl(long_url, (err, reply) => {
          assert.equal(reply, short_url)
          done()
        })
      })
    })

    it('queryHash should return an Object containing url and hash', done => {
      fakeredis.multi([
        ['set', redis.kUrl(long_url), short_url],
        ['hmset', redis.kHash(short_url),
          'url', long_url,
          'hash', short_url
        ]
      ])
      .exec((err, replies) => {
        redis.queryHash(short_url, (err, reply) => {
          assert.equal(reply.url, long_url)
          assert.equal(Object.keys(reply).length, 2)

          process.env._hash2 = reply.hash
          done()
        })
      })
    })

    it('set should return an Object containing url and hash', done => {
      redis.set(long_url, (err, reply) => {
        assert.equal(reply.hash, process.env._hash2)
        assert.equal(reply.long_url, long_url)
        assert.equal(Object.keys(reply).length, 2)
        done()
      })
    })

    it('get should return an Object containing', done => {
      fakeredis.multi([
        ['set', redis.kUrl(long_url), short_url],
        ['hmset', redis.kHash(short_url),
          'url', long_url,
          'hash', short_url,
          'clicks', 1
        ]
      ])
      .exec((err, replies) => {
        redis.get(short_url, (err, reply) => {
          assert.equal(reply.hash, process.env._hash2)
          assert.equal(reply.long_url, long_url)
          assert.equal(reply.clicks, 1)
          assert.equal(Object.keys(reply).length, 3)
          done()
        })
      })
    })
  })


  describe('Conf', () => {
    beforeEach(() => {
      fakeredis = require('fakeredis').createClient(0, 'localhost', { fast: true })
      conf.configureRedisModel = (callback) => {
        callback(null, new RedisModel(null, fakeredis))
      }
      long_url = 'https://www.google.com'
    })

    it('should shorten url', done => {
      conf.shorten(long_url, (err, reply) => {
        assert.equal(reply.long_url, long_url)
        assert.equal(Object.keys(reply).length, 2)

        process.env._hash = reply.hash
        done()
      })
    })

    it('should burst url', done => {
      conf.burst(env.url + '/' + process.env._hash, (err, reply) => {
        assert.equal(reply.hash, process.env._hash)
        assert.equal(reply.long_url, long_url)
        assert.equal(reply.clicks, 0)
        assert.equal(Object.keys(reply).length, 3)
        done()
      })
    })

    it('should not burst wrong url', done => {
      conf.burst(env.url + '/' + process.env._hash + '4', (err, reply) => {
        assert.equal(err, 404)
        done()
      })
    })
  })

})