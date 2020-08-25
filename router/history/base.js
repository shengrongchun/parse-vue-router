
import { inBrowser } from '../util/dom'
//import { START } from '../util/route'

export class History {
  constructor(router, base) {
    //路由实例对象
    this.router = router //$router
    //基本路径
    this.base = normalizeBase(base)
    // start with a route object that stands for "nowhere"
    //当前路由对象 但一开始的当前路由应该空路由
    this.current = {} //$route
    console.log('初始化当前路由', this.current)
  }
  getCurrentLocation() {//获取当前location
    return getLocation(this.base)
  }

  transitionTo(location) {
    //新匹配创建的route
    const route = this.router.match(location, this.current)
    this.updateRoute(route)
  }
  updateRoute(route) {
    this.current = route
    console.log('路由改变', this.cb)
    this.cb && this.cb(route) // 去改变 实例的_route
  }
  listen(cb) {
    this.cb = cb
  }
  push(location) {
    this.transitionTo(location)
  }

}

export function getLocation(base) {
  let path = decodeURI(window.location.pathname)
  if (base && path.toLowerCase().indexOf(base.toLowerCase()) === 0) {
    path = path.slice(base.length)
  }
  return (path || '/') + window.location.search + window.location.hash
}

function normalizeBase(base) {
  if (!base) {
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
  // remove trailing slash
  return base.replace(/\/$/, '')
}
