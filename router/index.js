import { inBrowser } from './util/dom'
import { install } from './install'
import { createMatcher } from './create-matcher'
import { History } from './history/base'
import { normalizeLocation } from './util/location'

export default class VueRouter {
  constructor(options) {
    this.app = null //根实例
    this.options = options
    this.matcher = createMatcher(options.routes || [], this)
    //
    this.history = new History(this, options.base)
  }
  match(location) {
    return this.matcher.match(location)
  }
  //初始化方法
  init(app) {//app vue根实例
    if (this.app) return
    this.app = app
    const history = this.history
    //初始化时候去匹配更改当前路由
    history.transitionTo(history.getCurrentLocation())
    //
    history.listen(route => {
      app._route = route
      //不刷新更改浏览器url
      window.history.pushState(null, null, route.path)
    })
  }
  //router-link 组件中用到，获取location-->push-->transitionTo
  resolve(
    to
  ) {
    const location = normalizeLocation(to)
    return {
      location,
    }
  }
  push(location) {
    this.history.push(location)
  }
}
//
VueRouter.install = install
VueRouter.version = '__VERSION__'

if (inBrowser && window.Vue) {
  window.Vue.use(VueRouter)
}