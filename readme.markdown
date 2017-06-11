# rxjs-ratelimiter

[![build status](https://circleci.com/gh/ohjames/rxjs-ratelimiter.png)](https://circleci.com/gh/ohjames/rxjs-ratelimiter)

An rxjs websocket library to facilitate dealing with rate limited resources (say, external REST APIs). Great for use with [@angular/http](https://www.npmjs.com/package/@angular/http).

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
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import RateLimiter from 'rxjs-ratelimiter'

@Injectable()
export class RateLimitedApi {
  // allow at most 6 requests every 1000ms
  rateLimiter = new RateLimiter(6, 1000)

  constructor(private http: Http) {}

  makeRequest(path: string): Promise<Response> {
    return this.rateLimiter.limit(
      this.http.get(`https://some.api/${path}`)
    ).toPromise()
  }
}
```

`rateLimiter.limit` returns an observable that rate limits the subscription to the passed observable. To understand how this works it is important to realise that cold observables create requests lazily when subscribed to, not when they are instantiated. In this example the http request happens when the rate limiter passes a subscription through to the observable returned by `this.http.get`, not at the time that `this.http.get` is called.

## Retrying requests

```javascript
const rateLimiter = new RateLimiter(1, 1000)
return rateLimiter.limit(
  this.http.get(`https://some.api/`)
).retry(999)
```

This will produce an observable that will retry the HTTP request until 1000 requests have failed with each retry also being rated limited. In this example each request will happen once per second, less if the rate limiter is being used for other requests.
