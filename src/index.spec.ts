import { assert } from 'chai'
import 'mocha'
import { of } from 'rxjs'
import { mergeMap, retry } from 'rxjs/operators'
import { TestScheduler } from 'rxjs/testing'

import RateLimiter from '.'

describe('rxjs-ratelimiter', () => {
  let scheduler: TestScheduler
  let expect: typeof scheduler.expectObservable
  let flush: typeof scheduler.flush
  let cold: typeof scheduler.createColdObservable
  beforeEach(() => {
    scheduler = new TestScheduler(assert.deepEqual)
    expect = scheduler.expectObservable.bind(scheduler)
    flush = scheduler.flush.bind(scheduler)
    cold = scheduler.createColdObservable.bind(scheduler)
  })

  it('queues subscriptions according to rate limit of 1 request per 10 ticks', () => {
    const limiter = new RateLimiter(1, 10, scheduler)
    const limitObservable = value => limiter.limit(of(value))

    expect(limitObservable('a')).toBe('(a|)')
    expect(limitObservable('b')).toBe('-(b|)')
    expect(limitObservable('c')).toBe('--(c|)')
    flush()
  })

  it('queues subscriptions according to rate limit of 2 requests per 10 ticks', () => {
    const limiter = new RateLimiter(2, 10, scheduler)
    const limitObservable = value => limiter.limit(of(value))

    expect(limitObservable('a')).toBe('(a|)')
    expect(limitObservable('b')).toBe('(b|)')
    expect(limitObservable('c')).toBe('-(c|)')
    expect(limitObservable('d')).toBe('-(d|)')
    expect(limitObservable('e')).toBe('--(e|)')
    flush()
  })

  it('queues subsequent subscriptions according to rate limit of 2 requests per 10 ticks', () => {
    const limiter = new RateLimiter(2, 10, scheduler)
    const limitObservable = value => limiter.limit(of(value))

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

  it('queues retry after original according to rate limit', () => {
    const limiter = new RateLimiter(1, 20, scheduler)
    let iteration = 0

    expect(
      limiter
        .limit(
          // this observable fails the first two times it is subscribed to
          of(null).pipe(mergeMap(() => (++iteration === 3 ? cold('a|') : cold('#')))),
        )
        .pipe(retry()),
    ).toBe('----a|')
    flush()
  })
})
