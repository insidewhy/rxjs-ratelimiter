import { Observable } from 'rxjs/Observable'

export default class RateLimiter {
  private intervalEnds = 0

  constructor(private requestsPerInterval: number, private intervalLength: number) {}

  limit<T>(stream: Observable<T>): Observable<T> {
    // TODO: rate limiting
    return stream
  }
}
