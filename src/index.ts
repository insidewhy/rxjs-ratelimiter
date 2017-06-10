import { Observable } from 'rxjs/Observable'
import { Scheduler } from 'rxjs/Scheduler'
import { async as asyncScheduler } from 'rxjs/scheduler/async'
import 'rxjs/add/observable/of'
import 'rxjs/add/operator/concatMap'
import 'rxjs/add/operator/switchMapTo'
import 'rxjs/add/operator/delay'

export default class RateLimiter {
  private intervalEnds = 0
  private nActiveInCurrentInterval = 0

  constructor(
    private requestsPerInterval: number,
    private intervalLength: number,
    private scheduler: Scheduler = asyncScheduler,
  ) {}

  limit<T>(stream: Observable<T>): Observable<T> {
    return Observable.of(null).concatMap(() => {
      const now = this.scheduler.now()
      if (this.intervalEnds <= now) {
        this.nActiveInCurrentInterval = 1
        this.intervalEnds = now + this.intervalLength
        return stream
      } else {
        if (++this.nActiveInCurrentInterval > this.requestsPerInterval) {
          this.nActiveInCurrentInterval = 1
          this.intervalEnds += this.intervalLength
        }

        const wait = this.intervalEnds - this.intervalLength - now
        return wait > 0 ? Observable.of(null).delay(wait, this.scheduler).switchMapTo(stream) : stream
      }
    })
  }
}
