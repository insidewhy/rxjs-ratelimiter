import 'mocha'
import { Observable } from 'rxjs/Observable'
import { TestScheduler } from 'rxjs/testing/TestScheduler'
import 'rxjs/add/observable/of'
import { assert } from 'chai'

import RateLimiter from '.'

describe('rxjs-ratelimiter', () => {
  let scheduler: TestScheduler
  let expect: typeof scheduler.expectObservable
  let flush: typeof scheduler.flush
  beforeEach(() => {
    scheduler = new TestScheduler(assert.deepEqual)
    expect = scheduler.expectObservable.bind(scheduler)
    flush = scheduler.flush.bind(scheduler)
  })

  it('queues subscriptions according to rate limit', () => {
    const limiter = new RateLimiter(2, 10, scheduler)

    let nObserved = 0
    const limitObservable = value => limiter.limit(Observable.of(value))

    expect(limitObservable('a')).toBe('(a|)')
    expect(limitObservable('b')).toBe('(b|)')
    expect(limitObservable('c')).toBe('-(c|)')
    expect(limitObservable('d')).toBe('-(d|)')
    expect(limitObservable('e')).toBe('--(e|)')
    flush()
  })

  it('queues subsequent subscriptions according to rate limit', () => {
    const limiter = new RateLimiter(2, 10, scheduler)

    let nObserved = 0
    const limitObservable = value => limiter.limit(Observable.of(value))

    expect(limitObservable('a')).toBe('(a|)')
    flush()
    assert.equal(scheduler.now(), 0)
    expect(limitObservable('b')).toBe('(b|)')
    flush()
    assert.equal(scheduler.now(), 0)
    expect(limitObservable('c')).toBe('-(c|)')
    flush()
    assert.equal(scheduler.now(), 10)
    expect(limitObservable('d')).toBe('-(d|)')
    expect(limitObservable('e')).toBe('--(e|)')
    flush()
    assert.equal(scheduler.now(), 20)
  })
})
