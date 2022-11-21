import { asyncScheduler, Observable, of, SchedulerLike } from 'rxjs'
import { concatMap, delay, switchMap } from 'rxjs/operators'

export default class RateLimiter {
  private intervalEnds = 0
  private nActiveInCurrentInterval = 0

  constructor(
    private requestsPerInterval: number,
    private intervalLength: number,
    private scheduler: SchedulerLike = asyncScheduler,
  ) {}

  limit<T>(stream: Observable<T>): Observable<T> {
    return of(null).pipe(
      concatMap(() => {
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
          return wait > 0
            ? of(null).pipe(
                delay(wait, this.scheduler),
                switchMap(() => stream),
              )
            : stream
        }
      }),
    )
  }
}
