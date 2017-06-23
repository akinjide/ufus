module.exports = (app, conf) => {
  const http = require('http')
  const vhost = require('vhost')
  const api = require('./api.js')

  // TODO: configure vhost.
  app.use('/v1/', api(app, conf))
  app.use(vhost('api.ufus.cc/v1/', api(app, conf)))

  app.route('/').all((req, res) => {
    res.render('index')
  })

  app.get(/^\/([\w=]+)$/, (req, res, next) => {
    conf.burst(req.params[0], (err, reply) => {
      if (err) {
        next()
      } else {
        res.redirect(301, reply.long_url)
      }
    })
  })

  // catch 404 and forwarding to error handler
  app.use((req, res, next) => {
    const err = new Error('Not Found')
    err.status = 404

    next(err)
  })

  // development error handler
  // will print stacktrace
  if (app.get('env') === 'development') {
    app.use((err, req, res, next) => {
      console.log('Caught exception: ' + err + '\n' + err.stack)
      res.status(err.status || 500)

      if (/^\/v1/.test(req.originalUrl)) {
        res.json({
          status: err.status || 500,
          statusText: http.STATUS_CODES[err.status] || http.STATUS_CODES[500]
        })
      } else {
        res.render('error', {
          code: err.status || 500,
          message: err.message,
          error: err
        })
      }

    })
  }

  // production error handler
  // no stacktraces leaked to user
  app.use((err, req, res, next) => {
    res.status(err.status || 500)

    if (/^\/v1/.test(req.originalUrl)) {
      res.json({
        status: err.status || 500,
        statusText: http.STATUS_CODES[err.status] || ''
      })
    } else {
      res.render('error', {
        code: err.status || 500,
        message: err.message,
        error: false
      })
    }

  })
}