
import { History } from './base'

export class HTML5History extends History {

  constructor(router, base) {
    super(router, base)
    this._startLocation = getLocation(this.base)
  }

  push(location) {
    this.transitionTo(location)
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
