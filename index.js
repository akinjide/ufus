// TODO
// allow user supply own short-code for a URL
// The error message should be away from the form, and leave after notifying
// keep track of all shortened link if user signs up. // might skip this.

const express = require('express')
const app = module.exports = express()
const path = require('path')
const env = require(path.join(__dirname, 'config', 'env.js'))
const conf = require(path.join(__dirname, 'lib', 'conf.js'))(env)
const port = env.port

process.addListener('uncaughtException', (err, stack) => {
  console.log('Caught exception: ' + err + '\n' + err.stack)
})

app.set('__dirname', __dirname)
app.set('env', env)

// express configuration and routes
require(path.join(__dirname, 'config', 'express.js'))(express, app)
require(path.join(__dirname, 'routes'))(app, conf)


app.listen(port, () => {
  console.log('Racing on ' + port)
  console.log('(Press CTRL+C to quit)')
})
