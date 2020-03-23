import { ReplaySubject, combineLatest, isObservable, of } from 'rxjs'
import { constant, isFunction } from 'lodash'
import { switchMap } from 'rxjs/operators'

export default () => {
  const instances = {}
  const singletons = {}
  const subjects = {}

  const app = {
    share(abstract, concrete) {
      app.bind(abstract, concrete, true)
    },

    bind(abstract, concrete, shared = false) {
      const subject = resolve(abstract)
      const create = wrap(concrete)

      singletons[abstract] = shared

      if (!shared) {
        delete instances[abstract]
      }

      subject.next(create)
    },

    make(abstract, ...args) {
      return resolve(abstract).pipe(
        switchMap((create) => {
          if (abstract in instances) {
            return instances[abstract]
          }

          const instance = build(create, args)

          if (singletons[abstract]) {
            instances[abstract] = instance
          }

          return instance
        })
      )
    },

    // prettier-ignore
    build(...args) {
      return combineLatest(
        ...args.map((arg) => {
          switch (typeof arg) {
            case 'string': return app.make(arg)
            case 'array': return arg.map(app.make)
            default: return arg
          }
        })
      )
    }
  }

  const build = (create, args) => {
    const instance = create(app, ...args)

    return isObservable(instance) ? instance : of(instance)
  }

  const resolve = (abstract) => {
    if (abstract in subjects) {
      return subjects[abstract]
    }

    const subject = new ReplaySubject(1)

    subjects[abstract] = subject

    return subject
  }

  const wrap = (concrete) => {
    return isFunction(concrete) ? concrete : constant(concrete)
  }

  return app
}
