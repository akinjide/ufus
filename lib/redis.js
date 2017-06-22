const redis = require('redis')
const crypto = require('crypto')
const base58 = require('base58')

const RedisModel = module.exports = function (config, client) {
  if (config === null && client) {
    this.db = client
  } else {
    const options = {
      host: config.host,
      port: config.port,
      db: config.db
    }

    this.db = redis.createClient(options)

    if (config.pass) {
      this.db.auth(config.pass)
    }
  }
}

RedisModel._prefix = 'shortio:'
const getRandomInt = (min, max) => Math.floor(Math.random() * (max -min)) + min

RedisModel.prototype = {
  kCounter: () => RedisModel._prefix + 'counter',
  kHash: (hash) => RedisModel._prefix + 'hash:' + hash,
  md5: (url) => crypto.createHash('md5').update(url).digest('hex'),
  kUrl: function(url) {
    return RedisModel._prefix + 'url:' + this.md5(url)
  },
  uniqId: function(fn) {
    this.db.incr(this.kCounter(), (err, reply) => {
      fn(err, base58.encode(getRandomInt(9999, 999999) + reply.toString()))
    })
  },
  queryUrl: function(long_url, fn) {
    this.db.get(this.kUrl(long_url), (err, reply) => fn(err, reply))
  },
  queryHash: function(short_url, fn) {
    this.db.hgetall(this.kHash(short_url), (err, reply) => fn(err, reply))
  },
  set: function (long_url, fn) {
    const _this = this

    this.queryUrl(long_url, (err, reply) => {
      if (err) {
        fn(500)
        _this.db.quit()
      } else if (reply) {
        fn(null, {
          'hash': reply,
          'long_url': long_url
        })
        _this.db.quit()
      } else {
        _this.uniqId((err, hash) => {
          if (err) {
            fn(500)
            _this.db.quit()
          } else {
            const response = {
              'hash': hash,
              'long_url': long_url
            }

            _this
              .db
              .multi([
                ['set', _this.kUrl(long_url), response.hash],
                ['hmset', _this.kHash(response.hash),
                  'url', long_url,
                  'hash', response.hash
                ]
              ])
              .dbsize()
              .exec((err, replies) => {
                console.log(replies)
                if (err) {
                  fn(503)
                } else {
                  fn(null, response)
                }

                _this.db.quit()
              })
          }
        })
      }
    })
  },
  get: function(short_url, fn) {
    const _this = this

    this.queryHash(short_url, (err, reply) => {
      if (err) {
        fn(500)
      } else if (reply && 'url' in reply) {
        fn(null, {
          'hash': reply.hash,
          'long_url': reply.url
        })
      } else {
        fn(404)
      }

      _this.db.quit()
    })
  }
}