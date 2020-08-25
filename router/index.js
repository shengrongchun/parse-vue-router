import { inBrowser } from './util/dom'
import { install } from './install'
import { createMatcher } from './create-matcher'
import { History } from './history/base'
import { normalizeLocation } from './util/location'

export default class VueRouter {
  constructor(options) {
    this.app = null //根实例
    this.apps = [] //存放多个根实例
    this.options = options
    this.matcher = createMatcher(options.routes || [], this)
    //
    this.history = new History(this, options.base)
  }
  //匹配返回的路由
  match(location, current) {
    return this.matcher.match(location, current)
  }
  //初始化方法
  init(app) {//app vue根实例
    //如果多个vue实例公用一个vueRouter对象，就需要通过apps收集这些vue实例
    //然后改变实例的当前路由： this.apps.forEach((app) => { app._route = route})
    this.apps.push(app)
    if (this.app) return
    this.app = app
    const history = this.history
    //初始化时候去匹配更改当前路由
    history.transitionTo(history.getCurrentLocation())
    //
    history.listen(route => {
      this.apps.forEach((app) => {
        console.log('_route 值改变了', route)
        //根实例的_route值得改变，由于 
        // install.js: Vue.util.defineReactive(this, '_route', this._router.history.current)
        //是页面更新模式的响应式的，所有当我们改变_route值，页面会重新渲染，router-view组件会
        //重新执行
        app._route = route
      })
      //不刷新更改浏览器url
      window.history.pushState(null, null, route.fullPath)
    })
  }
  //router-link 组件中用到，获取location-->push-->transitionTo
  resolve(
    to,
    current,
    append
  ) {
    current = current || this.history.current
    const location = normalizeLocation(
      to,
      current,
      append,
      this
    )
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