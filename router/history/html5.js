
import { History } from './base'
import { cleanPath } from '../util/path'
import { pushState, replaceState, supportsPushState } from '../util/push-state'

export class HTML5History extends History {

  constructor(router, base) {
    super(router, base)
    this._startLocation = getLocation(this.base)
  }

  go(n) {
    window.history.go(n)
  }

  push(location) {
    const onComplete = (route) => {
      //不刷新更改浏览器url 并且增加一条记录，浏览器可以回退
      pushState(cleanPath(this.base + route.path))
    }
    this.transitionTo(location, onComplete)
  }

  replace(location) {
    const onComplete = (route) => {
      //不刷新更改浏览器url 并且刷新记录
      replaceState(cleanPath(this.base + route.path))
    }
    this.transitionTo(location, onComplete)
  }

  ensureURL(push) { //确保当前路由的path和url保持一致
    if (getLocation(this.base) !== this.current.path) {
      const current = cleanPath(this.base + this.current.path)
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
