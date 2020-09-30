import { inBrowser } from './util/dom'
import { install } from './install'
import { assert } from './util/warn'
import { cleanPath } from './util/path'
import { createMatcher } from './create-matcher'
import { normalizeLocation } from './util/location'
import { supportsPushState } from './util/push-state'
import { handleScroll } from './util/scroll'

import { HTML5History } from './history/html5'

// 这里的this --> $router
export default class VueRouter {
  constructor(options) {
    this.app = null //根实例
    this.apps = [] //存放多个根实例
    this.options = options
    // https://router.vuejs.org/zh/guide/advanced/navigation-guards.html
    this.beforeHooks = [] // 存放全局路由前置守卫函数数组
    this.resolveHooks = [] //存放全局路由解析守卫函数数组
    this.afterHooks = [] //存放全局路由后置钩子函数数组
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
    const handleInitialScroll = (routeOrError) => {//滚动行为
      const from = history.current
      const expectScroll = this.options.scrollBehavior
      const supportsScroll = supportsPushState && expectScroll

      if (supportsScroll && 'fullPath' in routeOrError) {
        handleScroll(this, routeOrError, from, false)
      }
    }
    const onCompleteOrAbort = (routeOrError) => {
      history.setupListeners()
      handleInitialScroll(routeOrError)
    } //路由跳转成功或者失败我们可能需要执行的函数
    history.transitionTo(history.getCurrentLocation(), onCompleteOrAbort, onCompleteOrAbort)
    //
    history.listen(route => {
      this.apps.forEach((app) => {
        console.log('_route 值改变了', route)
        app._route = route
      })
    })
  }
  //
  beforeEach(fn) {
    return registerHook(this.beforeHooks, fn)
  }
  beforeResolve(fn) {
    return registerHook(this.resolveHooks, fn)
  }
  afterEach(fn) {
    return registerHook(this.afterHooks, fn)
  }
  onReady(cb, errorCb) {
    this.history.onReady(cb, errorCb)
  }
  onError(errorCb) {
    this.history.onError(errorCb)
  }
  //
  push(location, onComplete, onAbort) {
    if (!onComplete && !onAbort && typeof Promise !== 'undefined') {
      return new Promise((resolve, reject) => {
        this.history.push(location, resolve, reject)
      })
    } else {
      this.history.push(location, onComplete, onAbort)
    }
  }
  //
  replace(location, onComplete, onAbort) {
    if (!onComplete && !onAbort && typeof Promise !== 'undefined') {
      return new Promise((resolve, reject) => {
        this.history.replace(location, resolve, reject)
      })
    } else {
      this.history.replace(location, onComplete, onAbort)
    }
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
    const route = this.match(location, current)
    const fullPath = route.redirectedFrom || route.fullPath
    const base = this.history.base
    const href = createHref(base, fullPath, this.mode)
    return {
      location,
      route,
      href,
      // for backwards compat
      normalizedTo: location,
      resolved: route
    }
  }
}
//
function registerHook(list, fn) {
  list.push(fn) // 把相应类型函数存放到相应类型数组中
  return () => {// 返回一个移除已注册的守卫/钩子的函数
    const i = list.indexOf(fn)
    if (i > -1) list.splice(i, 1)
  }
}
//
function createHref(base, fullPath, mode) {
  var path = mode === 'hash' ? '#' + fullPath : fullPath
  return base ? cleanPath(base + '/' + path) : path
}
//
VueRouter.install = install
VueRouter.version = '__VERSION__'

if (inBrowser && window.Vue) {
  window.Vue.use(VueRouter)
}