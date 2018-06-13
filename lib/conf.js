const URL = require('url')
const axios = require('axios')
const async = require('async')
const util = require('util')
const extend = (util)._extend

module.exports = (env) => {
  const _this = {}
  const defaults = {
    appName: 'Ufus'
  }

  _this.env = extend(defaults, env)

  _this.get = (url) => {
    return axios({
      method: 'GET',
      url: url
    })
    .then(response => {
      if (response && response.data) {
        const { status, statusText, data } = response

        return { status, statusText, data }
      } else {
        throw new Error('REQERR: Empty Response')
      }
    })
  }

  _this.ping = (url, fn) => {
    async.retry(3, (callback) => {
      _this
        .get(url)
        .then(response => {
	  callback(null, response.statusText)
        })
        .catch(err => {
	  callback(err)
        })
    }, fn)
  }

  _this.makeURI = (url) => {
    const regexp = /:\/\//

    if (!(regexp.test(url))) {
      url = 'http://' + url
    }

    return url
  }

  _this.validate = (url, domain) => {
    const regexp = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
    let valid = true

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
    const longurl = _this.makeURI(long_url)

    if (_this.validate(longurl, true)) {
      _this.ping(longurl, (err, response) => {
        if (err) {
          fn(400)
        } else {
          _this.configureRedisModel((err, model) => {
            if (err) {
              fn(500)
            } else {
              model.set(longurl, fn)
            }
          })
        }
      })
    } else {
      fn(400)
    }
  }

  _this.burst = (short_url, fn, click) => {
    if (_this.validate(short_url)) {
      short_url = short_url.split('/').pop()
    }

    if (short_url && /^[\w=]+$/.test(short_url)) {
      _this.configureRedisModel((err, model) => {
        if (err) {
          fn(500)
        } else {
          model.get(short_url, fn, click)
        }
      })
    } else {
      fn(400)
    }
  }

  return _this
}
