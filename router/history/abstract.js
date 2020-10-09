
import { History } from './base'
import { isRouterError } from '../util/warn'
import { NavigationFailureType } from './errors'

export class AbstractHistory extends History {

  constructor(router, base) {
    super(router, base)
    this.stack = []
    this.index = -1
  }

  push(location, onComplete, onAbort) {
    this.transitionTo(
      location,
      route => {
        this.stack = this.stack.slice(0, this.index + 1).concat(route)
        this.index++
        onComplete && onComplete(route)
      },
      onAbort
    )
  }

  replace(location, onComplete, onAbort) {
    this.transitionTo(
      location,
      route => {
        this.stack = this.stack.slice(0, this.index).concat(route)
        onComplete && onComplete(route)
      },
      onAbort
    )
  }

  getCurrentLocation() {
    const current = this.stack[this.stack.length - 1]
    return current ? current.fullPath : '/'
  }

  ensureURL() {
    // noop
  }
}
