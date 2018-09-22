# rxjs-ratelimiter

[![build status](https://circleci.com/gh/ohjames/rxjs-ratelimiter.png)](https://circleci.com/gh/ohjames/rxjs-ratelimiter)

An rxjs library to facilitate dealing with rate limited resources (say, external REST APIs). Great for use with [@angular/http](https://www.npmjs.com/package/@angular/http).

This library is [fully tested](src/index.spec.ts) using rxjs's [marble testing](https://github.com/ReactiveX/rxjs/blob/master/doc/writing-marble-tests.md) and rxjs's [TestScheduler](http://reactivex.io/rxjs/file/es6/testing/TestScheduler.js.html) to provide virtual time scheduling.

## How to install

```bash
npm install -S rxjs-ratelimiter
```

```bash
yarn add rxjs-ratelimiter
```

## How to use

This example uses angular 2:

```javascript
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import RateLimiter from 'rxjs-ratelimiter'

@Injectable()
export class RateLimitedApi {
  // allow at most 6 requests every 1000ms
  private rateLimiter = new RateLimiter(6, 1000)

  constructor(private http: Http) {}

  makeRequest(path: string): Promise<Response> {
    return this.rateLimiter.limit(
      this.http.get(`https://my.api/${path}`)
    ).toPromise()
  }
}
```

`rateLimiter.limit` returns an observable that rate limits the subscription to the passed observable. To understand how this works it is important to realise that cold observables create requests lazily (when subscribed to, not when instantiated). In this example the http request happens when the rate limiter passes a subscription through to the observable returned by `this.http.get`, not at the time that `this.http.get` is called.

## Retrying requests

A consequence of the lazy nature of rate limited observable is that resubscriptions by operators chained from them (such as [retry](http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-retry)) will also be subject to rate limitation.

```javascript
this.rateLimiter.limit(
  this.http.get(`https://my-api.co/`)
).pipe(retry())
```

This will produce an observable that will retry the HTTP request until it succeeds. The rate limiter also applies to the retries so at most one request can happen per second, less if the rate limiter is being used for other requests. To have the rate limiter apply to the initial request but not the retries the following modification can be made:

```javascript
this.rateLimiter.limit(this.http.get(`https://some.api/`).pipe(retry()))
```
