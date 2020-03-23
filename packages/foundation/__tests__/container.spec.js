import { TestScheduler } from 'rxjs/testing'
import { delay, map } from 'rxjs/operators'
import { of } from 'rxjs'
import Container from '@quarter/foundation/Container'

describe('container', () => {
  let scheduler

  beforeEach(() => {
    scheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected)
    })
  })

  test('bind constructor value', () => {
    scheduler.run((context) => {
      const { expectObservable } = context
      const container = Container()

      container.bind('a', (_, a) => 'a' + a)

      const a$ = container.make('a', 'a')
      const b$ = container.make('a', 'b')

      expectObservable(a$).toBe('0', ['aa'])
      expectObservable(b$).toBe('0', ['ab'])
    })
  })

  test('bind constructor observable', () => {
    scheduler.run((context) => {
      const { expectObservable } = context
      const container = Container()

      container.bind('a', (_, a) => of('a').pipe(map((text) => text + a)))

      const a$ = container.make('a', 'a')
      const b$ = container.make('a', 'b')

      expectObservable(a$).toBe('0', ['aa'])
      expectObservable(b$).toBe('0', ['ab'])
    })
  })

  test('bind constructor dependency', () => {
    scheduler.run((context) => {
      const { expectObservable } = context
      const container = Container()

      container.bind('a', () => 'a')
      container.bind('b', (container, b) =>
        container.make('a').pipe(map((a) => a + b))
      )

      const a$ = container.make('b', 'a')
      const b$ = container.make('b', 'b')

      expectObservable(a$).toBe('0', ['aa'])
      expectObservable(b$).toBe('0', ['ab'])
    })
  })

  test('bind constructor piped dependency', () => {
    scheduler.run((context) => {
      const { expectObservable } = context
      const container = Container()

      container.bind('a', of('a').pipe(delay(1)))
      container.bind('b', (container, b) =>
        container.make('a').pipe(map((a) => a + b))
      )

      const a$ = container.make('b', 'a')
      const b$ = container.make('b', 'b')

      expectObservable(a$).toBe('-0', ['aa'])
      expectObservable(b$).toBe('-0', ['ab'])
    })
  })

  test('bind observable', () => {
    scheduler.run((context) => {
      const { expectObservable } = context
      const container = Container()

      container.bind('a', of('a'))

      const a$ = container.make('a')

      expectObservable(a$).toBe('0', ['a'])
    })
  })

  test('build contructor', () => {
    scheduler.run((context) => {
      const { expectObservable } = context
      const container = Container()

      container.bind('a', of('a'))

      const a$ = container.build('a', 'b', (a, b) => a + b)

      container.bind('b', of('b'))

      expectObservable(a$).toBe('0', ['ab'])
    })
  })
})
