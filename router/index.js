import { inBrowser } from './util/dom'
import { install } from './install'
import { createMatcher } from './create-matcher'
import { History } from './history/base'
//import { normalizeLocation } from './util/location'

// 这里的this --> $router
export default class VueRouter {
  constructor(options) {
    this.app = null //根实例
    //创建当前路由可以弄一个公共方法，这样路由更改的时候，调用公共创建方法即可
    this.history = new History(this, options.base)
    // 根据路径匹配创建 route
    this.matcher = createMatcher(options.routes || [], this)
  }
  match() {// 返回匹配的路由
    return this.matcher.match()
  }
  //初始化方法目的有两个1：创建当前路由route 2：app._route = route
  init(app) {// app根实例
    if (this.app) return
    this.app = app
    // 
    const history = this.history
    //初始化时候去匹配更改当前路由
    history.transitionTo()
  }

}
//
VueRouter.install = install
VueRouter.version = '__VERSION__'

if (inBrowser && window.Vue) {
  window.Vue.use(VueRouter)
}