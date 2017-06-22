"use strict";

const fakeredis = require('fakeredis')
const assert = require('assert')

const RedisModel = require('../lib/redis')

describe('Unit : Redis', () => {
  let redis, prefix, long_url, short_url

  beforeEach(() => {
    redis = new RedisModel(null, fakeredis.createClient(0, 'localhost', { fast: true }))
    prefix = RedisModel._prefix
    long_url = 'https://www.apple.com'
    short_url = 'oly8'
  })

  it('kCounter should return a key', done => {
    assert(redis.kCounter(), prefix + 'counter')
    done()
  })

  it('kUrl should return a key with hash', done => {
    assert(redis.kUrl(long_url), prefix + 'url:82cc5b2a23492c33d2115e3a27bfcbec')
    done()
  })

  it('kHash should return a key with hash', done => {
    assert(redis.kHash(short_url), prefix + 'hash:' + short_url)
    done()
  })

  it('md5 should return a md5 hash', done => {
    assert(redis.md5(long_url), '82cc5b2a23492c33d2115e3a27bfcbec')
    done()
  })

  it('uniqId should return a unique key', done => {
    redis.uniqId((err, hash) => {
      assert(hash.length, 4)
      assert(hash, /[\w=]+/)
      done()
    })
  })
})