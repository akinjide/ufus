const path = require('path')
const cors = require('cors')
const morgan  = require('morgan')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const helmet = require('helmet')

module.exports = (express, app) => {
  __dirname = app.get('__dirname')

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'))

  console.log('Application starting...')

  // Middlewares
  app.use(helmet())
  app.disable('x-powered-by')
  app.use(cors())
  app.use(morgan('dev'))
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json())
  app.use(methodOverride())
  app.use(express.static(path.join(__dirname, 'public')))
};