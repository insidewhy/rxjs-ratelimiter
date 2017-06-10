import 'mocha'
import { Observable } from 'rxjs/Observable'
import { TestScheduler } from 'rxjs/testing/TestScheduler'
import 'rxjs/add/observable/of'
import { assert } from 'chai'

import RateLimiter from '.'

describe('rxjs-ratelimiter', () => {
  it('queues subscriptions according to rate limit', () => {
    const scheduler = new TestScheduler(assert.deepEqual)
    const limiter = new RateLimiter(2, 10, scheduler)

    let nObserved = 0
    const limitObservable = value => limiter.limit(Observable.of(value))

    scheduler.expectObservable(limitObservable('a')).toBe('(a|)')
    scheduler.expectObservable(limitObservable('b')).toBe('(b|)')
    scheduler.expectObservable(limitObservable('c')).toBe('-(c|)')
    scheduler.expectObservable(limitObservable('d')).toBe('-(d|)')
    scheduler.expectObservable(limitObservable('e')).toBe('--(e|)')
    scheduler.flush()
  })

  it('queues subsequent subscriptions according to rate limit', () => {
    const scheduler = new TestScheduler(assert.deepEqual)
    const limiter = new RateLimiter(2, 10, scheduler)

    let nObserved = 0
    const limitObservable = value => limiter.limit(Observable.of(value))

    scheduler.expectObservable(limitObservable('a')).toBe('(a|)')
    scheduler.flush()
    assert.equal(scheduler.now(), 0)
    scheduler.expectObservable(limitObservable('b')).toBe('(b|)')
    scheduler.flush()
    assert.equal(scheduler.now(), 0)
    scheduler.expectObservable(limitObservable('c')).toBe('-(c|)')
    scheduler.flush()
    assert.equal(scheduler.now(), 10)
    scheduler.expectObservable(limitObservable('d')).toBe('-(d|)')
    scheduler.expectObservable(limitObservable('e')).toBe('--(e|)')
    scheduler.flush()
    assert.equal(scheduler.now(), 20)
  })
})
