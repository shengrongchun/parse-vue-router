
import { History } from './base'
import { cleanPath } from '../util/path'
import { START } from '../util/route'
import { setupScroll, handleScroll } from '../util/scroll'
import { pushState, replaceState, supportsPushState } from '../util/push-state'

export class HTML5History extends History {

  constructor(router, base) {
    super(router, base)
    this._startLocation = getLocation(this.base)
  }
  setupListeners() {//
    if (this.listeners.length > 0) {
      return
    }

    const router = this.router
    const expectScroll = router.options.scrollBehavior
    const supportsScroll = supportsPushState && expectScroll

    if (supportsScroll) {
      this.listeners.push(setupScroll())
    }

    const handleRoutingEvent = () => {
      const current = this.current
      // Avoiding first `popstate` event dispatched in some browsers but first
      // history route not updated since async guard at the same time.
      const location = getLocation(this.base)
      if (this.current === START && location === this._startLocation) {
        return
      }

      this.transitionTo(location, route => {
        if (supportsScroll) {
          handleScroll(router, route, current, true)
        }
      })
    }
    window.addEventListener('popstate', handleRoutingEvent)
    this.listeners.push(() => {
      window.removeEventListener('popstate', handleRoutingEvent)
    })
  }

  go(n) {
    window.history.go(n)
  }

  push(location, onComplete, onAbort) {
    const Complete = (route) => {
      const { current: fromRoute } = this
      //不刷新更改浏览器url 并且增加一条记录，浏览器可以回退
      pushState(cleanPath(this.base + route.fullPath))
      handleScroll(this.router, route, fromRoute, false) //滚动行为
      onComplete && onComplete(route)
    }
    this.transitionTo(location, Complete, onAbort)
  }

  replace(location, onComplete, onAbort) {
    const Complete = (route) => {
      const { current: fromRoute } = this
      //不刷新更改浏览器url 并且刷新记录
      replaceState(cleanPath(this.base + route.fullPath))
      handleScroll(this.router, route, fromRoute, false) //滚动行为
      onComplete && onComplete(route)
    }
    this.transitionTo(location, Complete, onAbort)
  }

  ensureURL(push) { //确保当前路由的path和url保持一致
    if (getLocation(this.base) !== this.current.fullPath) {
      const current = cleanPath(this.base + this.current.fullPath)
      push ? pushState(current) : replaceState(current)
    }
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
