import { Subject } from 'rxjs'
import { memoize } from 'lodash'

export default () => {
  const listener = {
    on(event) {
      return resolve(event.type || event).toObservable()
    },

    send(event, data) {
      if (event.type) {
        resolve(event.type).next(event)
      } else {
        resolve(event).next(data)
      }
    },
  }

  const resolve = memoize(() => {
    return new Subject()
  })

  return listener
}
