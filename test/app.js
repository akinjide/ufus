const request = require('supertest')
const assert = require('assert')

const app = require('../')

describe('Integration : API', () => {
  it('should POST /v1/shorten', done => {
    const body = {
      long_url: 'https://www.apple.com'
    }

    request(app)
      .post('/v1/shorten')
      .set('Content-Type', 'application/json')
      .send(body)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.long_url, body.long_url)
        assert.equal(Object.keys(res.body).length, 5)

        process.env._hash = res.body.hash
        done()
      })
  })

  it('should POST /v1/shorten but return same hash', done => {
    const body = {
      long_url: 'https://www.apple.com'
    }

    request(app)
      .post('/v1/shorten')
      .set('Content-Type', 'application/json')
      .send(body)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.long_url, body.long_url)
        assert.equal(res.body.hash, process.env._hash)
        assert.equal(Object.keys(res.body).length, 5)
        done()
      })
  })

  it('should not POST /v1/shorten if long_url is a short_url', done => {
    const body = {
      long_url: 'http://127.0.0.1:3000/' + process.env._hash
    }

    request(app)
      .post('/v1/shorten')
      .set('Content-Type', 'application/json')
      .send(body)
      .expect('Content-Type', /json/)
      .expect(400)
      .end((err, res) => {
        assert.equal(res.body.statusText, "Bad Request")
        assert.equal(Object.keys(res.body).length, 2)
        done()
      })
  })

  it('should POST /v1/burst', done => {
    const body = {
      short_url: process.env._hash
    }

    request(app)
      .post('/v1/burst')
      .set('Content-Type', 'application/json')
      .send(body)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.long_url, 'https://www.apple.com')
        assert.equal(res.body.hash, process.env._hash)
        assert.equal(Object.keys(res.body).length, 4)
        done()
      })
  })

  it('should GET /v1/burst/hash', done => {
    request(app)
      .get('/v1/burst/' + process.env._hash)
      .set('Content-Type', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.long_url, 'https://www.apple.com')
        assert.equal(res.body.hash, process.env._hash)
        assert.equal(Object.keys(res.body).length, 4)
        done()
      })
  })
})