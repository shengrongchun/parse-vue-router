
import { History } from './base'
import { cleanPath } from '../util/path'
import { START } from '../util/route'
import { pushState, replaceState } from '../util/push-state'

export class HTML5History extends History {

  constructor(router, base) {
    super(router, base)
    this._startLocation = getLocation(this.base)
  }
  //
  setupListeners() {//
    if (this.listeners.length > 0) {
      return
    }

    const handleRoutingEvent = () => {
      // Avoiding first `popstate` event dispatched in some browsers but first
      // history route not updated since async guard at the same time.
      const location = getLocation(this.base)
      if (this.current === START && location === this._startLocation) {
        return
      }
      this.transitionTo(location, () => { })
    }
    window.addEventListener('popstate', handleRoutingEvent)
    this.listeners.push(() => {
      window.removeEventListener('popstate', handleRoutingEvent)
    })
  }

  push(location, onComplete, onAbort) {
    const Complete = (route) => {
      //不刷新更改浏览器url 并且增加一条记录，浏览器可以回退
      pushState(cleanPath(this.base + route.fullPath))
      onComplete && onComplete(route)
    }
    this.transitionTo(location, Complete, onAbort)
  }
  replace(location, onComplete, onAbort) {
    const Complete = (route) => {
      //不刷新更改浏览器url 并且刷新记录
      replaceState(cleanPath(this.base + route.fullPath))
      onComplete && onComplete(route)
    }
    this.transitionTo(location, Complete, onAbort)
  }

  getCurrentLocation() {
    return getLocation(this.base)
  }
}

// www.shengrongchun.com/pathname?search=123#hash=111
export function getLocation(base) {//获取url的path
  //
  let path = decodeURI(window.location.pathname) // /pathname
  if (base && path.toLowerCase().indexOf(base.toLowerCase()) === 0) {
    path = path.slice(base.length) // path中有base去掉
  }
  // /pathname?search=123#hash=111
  return (path || '/') + window.location.search + window.location.hash
}
