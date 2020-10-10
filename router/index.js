import { inBrowser } from './util/dom'
import { install } from './install'
import { START } from './util/route'
import { assert } from './util/warn'
import { cleanPath } from './util/path'
import { createMatcher } from './create-matcher'
import { normalizeLocation } from './util/location'
import { supportsPushState } from './util/push-state'
import { handleScroll } from './util/scroll'

import { HashHistory } from './history/hash'
import { HTML5History } from './history/html5'
import { AbstractHistory } from './history/abstract'

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
    // this.fallback 表示在浏览器不支持 history.pushState 的情况下，根据传入的 fallback 配置参数，决定是否回退到hash模式
    let mode = options.mode || 'hash'
    this.fallback = mode === 'history' && !supportsPushState && options.fallback !== false
    if (this.fallback) {
      mode = 'hash'
    }
    if (!inBrowser) {//非浏览器环境下
      mode = 'abstract'
    }
    this.mode = mode

    switch (mode) {
      case 'history':
        this.history = new HTML5History(this, options.base)
        break
      case 'hash':
        this.history = new HashHistory(this, options.base, this.fallback)
        break
      case 'abstract':
        this.history = new AbstractHistory(this, options.base)
        break
      default:
        if (process.env.NODE_ENV !== 'production') {
          assert(false, `invalid mode: ${mode}`)
        }
    }
  }
  match(location, current) {// 返回匹配的路由
    return this.matcher.match(location, current)
  }

  get currentRoute() {// 获取当前路由
    return this.history && this.history.current
  }

  //初始化方法目的有两个1：创建当前路由route 2：app._route = route
  init(app) {// app根实例
    process.env.NODE_ENV !== 'production' && assert(
      install.installed,
      `not installed. Make sure to call \`Vue.use(VueRouter)\` ` +
      `before creating root instance.`
    )
    this.apps.push(app)
    // set up app destroyed handler
    // https://github.com/vuejs/vue-router/issues/2639
    app.$once('hook:destroyed', () => {
      // clean out app from this.apps array once destroyed
      const index = this.apps.indexOf(app)
      if (index > -1) this.apps.splice(index, 1)
      // ensure we still have a main app or null if no apps
      // we do not release the router so it can be reused
      if (this.app === app) this.app = this.apps[0] || null

      if (!this.app) {
        // clean up event listeners
        // https://github.com/vuejs/vue-router/issues/2341
        this.history.teardownListeners()
      }
    })
    if (this.app) return
    this.app = app
    // 
    const history = this.history
    if (history instanceof HTML5History || history instanceof HashHistory) {
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
    }
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
  go(n) {
    this.history.go(n)
  }

  back() {
    this.go(-1)
  }

  forward() {
    this.go(1)
  }
  getMatchedComponents(to) {
    const route = to
      ? to.matched
        ? to
        : this.resolve(to).route
      : this.currentRoute
    if (!route) {
      return []
    }
    return [].concat.apply([], route.matched.map(m => {
      return Object.keys(m.components).map(key => {
        return m.components[key]
      })
    }))
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
  //
  addRoutes(routes) {
    this.matcher.addRoutes(routes)
    if (this.history.current !== START) {
      this.history.transitionTo(this.history.getCurrentLocation())
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