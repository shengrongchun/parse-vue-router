
import { inBrowser } from '../util/dom'
import { START, isSameRoute } from '../util/route'

export class History {
  constructor(router, base) {
    //路由实例对象
    this.router = router //$router
    //基本路径
    this.base = normalizeBase(base)
    // start with a route object that stands for "nowhere"
    //当前路由对象 但一开始的当前路由应该空路由
    this.current = START //$route
    console.log('初始化当前路由', this.current)
  }

  listen(cb) {
    this.cb = cb
  }

  transitionTo(location, onComplete) {
    //通过location来创建route
    const route = this.router.match(location, this.current)
    if (isSameRoute(route, this.current)) {//相同route
      return;
    }
    this.updateRoute(route)
    console.log('路由改变', route)
    onComplete(route) // 路由改变后执行的完成方法
  }

  updateRoute(route) {
    this.current = route
    this.cb && this.cb(route) // 去改变 实例的_route
  }
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

