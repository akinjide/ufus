/**
 *
 * Application Conf.
 *
 *
 * application uniform resource locator (URL)
 * application port number
 *
 *
 * REDIS
 *
 *
 * server hostname > redis-host
 * server port number > redis-port
 * server password > redis-pass
 * db index > redis-db
 *
 **/

module.exports = {
  'url': process.env.URL || 'http://127.0.0.1:3000',
  'port': process.env.PORT || 3000,
  'redis-host': process.env.REDIS_HOSTNAME || 'localhost',
  'redis-port': process.env.REDIS_PORT || 6379,
  'redis-pass': process.env.REDIS_PASSWORD || false,
  'redis-db': process.env.REDIS_DB || 0
}