module.exports = (app, conf) => {
  const http = require('http')
  const router = require('express').Router()
  const env = app.get('env')

  const response = (res, code, data) => {
    data = data || {}
    data.status = (http.STATUS_CODES[code]) ? code : 503
    data.statusText = http.STATUS_CODES[code] || http.STATUS_CODES[503]

    res.status(data.status).json(data)
  }

  const checkErrorAndReplyObject = (res, err, reply) => {
    if (err) {
      response(res, err)
    } else if (reply) {
      response(res, 200, reply)
    } else {
      response(res, 500)
    }
  }

  router.route('/shorten')
    .post((req, res) => {
      conf.shorten(req.body['long_url'], (err, reply) => {
        if (reply) {
          reply.short_url = env.url.replace(/\/$/, '') + '/' + reply.hash
        }

        checkErrorAndReplyObject(res, err, reply)
      })
    })

  router.route('/burst')
    .post((req, res) => {
      conf.burst(req.body['short_url'], (err, reply) => {
        checkErrorAndReplyObject(res, err, reply)
      })
    })

  router.route('/burst/:hash')
    .get((req, res) => {
      conf.burst(req.params.hash, (err, reply) => {
        checkErrorAndReplyObject(res, err, reply)
      })
    })

  return router
}
