import { inBrowser } from './util/dom'
import { install } from './install'
import { assert } from './util/warn'
import { createMatcher } from './create-matcher'
import { normalizeLocation } from './util/location'

import { HTML5History } from './history/html5'

// 这里的this --> $router
export default class VueRouter {
  constructor(options) {
    this.app = null //根实例
    this.apps = [] //存放多个根实例
    this.options = options
    // 根据路径匹配创建 route
    this.matcher = createMatcher(options.routes || [], this)
    //创建当前路由可以弄一个公共方法，这样路由更改的时候，调用公共创建方法即可
    this.history = new HTML5History(this, options.base)
  }
  match(location, current) {// 返回匹配的路由
    return this.matcher.match(location, current)
  }
  //初始化方法目的有两个1：创建当前路由route 2：app._route = route
  init(app) {// app根实例
    process.env.NODE_ENV !== 'production' && assert(
      install.installed,
      `not installed. Make sure to call \`Vue.use(VueRouter)\` ` +
      `before creating root instance.`
    )
    this.apps.push(app)
    if (this.app) return
    this.app = app
    // 
    const history = this.history
    //初始化时候去匹配更改当前路由
    history.transitionTo(history.getCurrentLocation())
    //
    history.listen(route => {
      this.apps.forEach((app) => {
        console.log('_route 值改变了', route)
        app._route = route
      })
    })
  }
  //
  push(location) {
    this.history.push(location)
  }
  //router-link 组件中用到，获取location-->push-->transitionTo
  resolve(
    to,
    current
  ) {
    current = current || this.history.current
    const location = normalizeLocation(
      to,
      current
    )
    return {
      location
    }
  }
}
//
VueRouter.install = install
VueRouter.version = '__VERSION__'

if (inBrowser && window.Vue) {
  window.Vue.use(VueRouter)
}