# rxjs-ratelimiter

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
import { Injectable, Input } from '@angular/core';
import { Http, Response } from '@angular/http';
import RateLimiter from 'rxjs-ratelimiter'
// allow 6 requests per second

@Injectable()
export class RateLimitedApi {
  rateLimiter = new RateLimiter(6, 1000)
  @Input()
  url: string = ''

  constructor(private http: Http) {}

  makeRequest(): Promise<Response> {
    return rateLimiter.limit(http.get(this.url)).toPromise()
  }
}
```
