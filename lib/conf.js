const URL = require('url')
const util = require('util')
const extend = (util)._extend

module.exports = (env) => {
  const _this = {}
  const defaults = {
    'url': 'http://127.0.0.1:3000',
    'port': 3000,
    'redis-host': 'localhost',
    'redis-port': 6379,
    'redis-pass': false,
    'redis-db': 0
  }

  _this.env = extend(defaults, env)

  _this.validate = (url, domain) => {
    const regexp = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
    var valid = true

    if (regexp.test(url) !== true) {
      valid = false
    }

    if (valid === true && domain === true) {
      if (URL.parse(_this.env.url).hostname === URL.parse(url).hostname) {
        valid = false
      }
    }

    return valid
  }

  _this.configureRedisModel = (fn) => {
    const RedisModel = require('./redis')
    const config = {
      host: _this.env['redis-host'],
      port: _this.env['redis-port'],
      pass: _this.env['redis-pass'],
      db: _this.env['redis-db']
    }

    fn(null, new RedisModel(config))
  }

  _this.shorten = (long_url, fn) => {
    if (_this.validate(long_url, true)) {
      _this.configureRedisModel((err, model) => {
        if (err) {
          fn(500)
        } else {
          model.set(long_url, fn)
        }
      })
    } else {
      fn(400)
    }
  }

  _this.burst = (short_url, fn) => {
    if (_this.validate(short_url)) {
      short_url = short_url.split('/').pop()
    }

    if (short_url && /^[\w=]+$/.test(short_url)) {
      _this.configureRedisModel((err, model) => {
        if (err) {
          fn(500)
        } else {
          model.get(short_url, fn)
        }
      })
    } else {
      fn(400)
    }
  }

  return _this
}