
import { inBrowser } from '../util/dom'
import { START } from '../util/route'

export class History {
  constructor(router, base) {
    //路由实例对象
    this.router = router //$router
    //基本路径
    this.base = normalizeBase(base)
    //当前路由
    this.current = START
    //存储一些监听事件
    this.listeners = []
  }
  //
  listen(cb) {
    this.cb = cb
  }
  //创建匹配的路由，然后改变当前路由
  transitionTo(location, onComplete, onAbort) {
    //新匹配创建的route
    let route
    try {
      route = this.router.match(location, this.current)
      onComplete && onComplete(route)
    } catch (e) {
      onAbort && onAbort(e)
      // Exception should still be thrown
      throw e
    }
    this.updateRoute(route)
  }
  //改变当前路由
  updateRoute(route) {
    this.current = route
    this.cb && this.cb(route) // 去改变 实例的_route
  }
  //
  setupListeners() {
    // Default implementation is empty
  }

  teardownListeners() {
    this.listeners.forEach(cleanupListener => {
      cleanupListener()
    })
    this.listeners = []
  }

}
//标准化base
function normalizeBase(base) {
  if (!base) {//没有base
    if (inBrowser) {
      // respect <base> tag
      const baseEl = document.querySelector('base')
      base = (baseEl && baseEl.getAttribute('href')) || '/'
      // strip full URL origin
      // eslint-disable-next-line no-useless-escape
      base = base.replace(/^https?:\/\/[^\/]+/, '')
    } else {
      base = '/'
    }
  }
  // make sure there's the starting slash
  if (base.charAt(0) !== '/') {
    base = '/' + base
  }
  // remove trailing slash // --> /
  return base.replace(/\/$/, '')
}
