# rxjs-ratelimiter

[![build status](https://circleci.com/gh/ohjames/rxjs-ratelimiter.png)](https://circleci.com/gh/ohjames/rxjs-ratelimiter)

An rxjs websocket library to facilitate dealing with rate limited resources (say, external REST APIs).

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
// allow 6 requests per second

@Injectable()
export class RateLimitedApi {
  // make at most 6 requests every 1000ms
  rateLimiter = new RateLimiter(6, 1000)

  constructor(private http: Http) {}

  makeRequest(path: string): Promise<Response> {
    return this.rateLimiter.limit(http.get(`https://some.api/${path}`)).toPromise()
  }
}
```

`rateLimiter.limit` returns an observable that rate limits the subscription to the passed observable. To understand how this works it is important to realise that cold observables (such as those created by `http.get` etc.) create requests lazily when subscribed to, not when they are instantiated (e.g. when `http.get` is run).
