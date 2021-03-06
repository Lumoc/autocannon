'use strict'

const test = require('tap').test
const run = require('../lib/run')
const helper = require('./helper')
const server = helper.startServer()

test('run should only send the expected number of requests per second', (t) => {
  t.plan(9)

  run({
    url: `http://localhost:${server.address().port}`,
    connections: 2,
    overallRate: 10,
    amount: 40
  }, (err, res) => {
    t.error(err)
    t.equal(Math.round(res.duration), 4, 'should have take 4 seconds to send 10 requests per seconds')
    t.equal(res.requests.average, 10, 'should have sent 10 requests per second on average')
  })

  run({
    url: `http://localhost:${server.address().port}`,
    connections: 2,
    connectionRate: 10,
    amount: 40
  }, (err, res) => {
    t.error(err)
    t.equal(Math.round(res.duration), 2, 'should have taken 2 seconds to send 10 requests per connection with 2 connections')
    t.equal(res.requests.average, 20, 'should have sent 20 requests per second on average with two connections')
  })

  run({
    url: `http://localhost:${server.address().port}`,
    connections: 15,
    overallRate: 10,
    amount: 40
  }, (err, res) => {
    t.error(err)
    t.equal(Math.round(res.duration), 4, 'should have take 4 seconds to send 10 requests per seconds')
    t.equal(res.requests.average, 10, 'should have sent 10 requests per second on average')
  })
})

test('run should compensate for coordinated omission when the expected number of requests per second is too high', (t) => {
  t.plan(2)

  run({
    url: `http://localhost:${server.address().port}`,
    connections: 100,
    connectionRate: 1000,
    duration: 1
  }, (err, res) => {
    t.error(err)
    t.notEqual(res.latency.totalCount, res.requests.total, 'should have recorded additionnal latencies')
  })
})

test('run should not compensate for coordinated omission when this feature is disabled', (t) => {
  t.plan(2)

  run({
    url: `http://localhost:${server.address().port}`,
    connections: 100,
    connectionRate: 1000,
    ignoreCoordinatedOmission: true,
    duration: 1
  }, (err, res) => {
    t.error(err)
    t.equal(res.latency.totalCount, res.requests.total, 'should not have recorded additionnal latencies')
  })
})
