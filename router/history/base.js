
import { inBrowser } from '../util/dom'
//import { START } from '../util/route'

export class History {
  constructor(router, base) {
    //路由实例对象
    this.router = router //$router
    //基本路径
    this.base = normalizeBase(base)
    //当前路由
    this.current = {}
  }
  //创建匹配的路由，然后改变当前路由
  transitionTo() {
    //新匹配创建的route
    const route = this.router.match()
    this.updateRoute(route)
  }
  //改变当前路由
  updateRoute(route) {
    this.current = route
  }

}

export function getLocation(base) {
  let path = decodeURI(window.location.pathname)
  if (base && path.toLowerCase().indexOf(base.toLowerCase()) === 0) {
    path = path.slice(base.length)
  }
  return (path || '/') + window.location.search + window.location.hash
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
