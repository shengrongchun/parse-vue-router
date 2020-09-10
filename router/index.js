import { inBrowser } from './util/dom'
import { install } from './install'
import { assert } from './util/warn'
import { createMatcher } from './create-matcher'
import { HTML5History } from './history/html5'
import { normalizeLocation } from './util/location'
//
export default class VueRouter {
  constructor(options) {
    this.app = null //根实例
    this.apps = [] //存放多个根实例
    this.options = options
    // https://router.vuejs.org/zh/guide/advanced/navigation-guards.html
    this.beforeHooks = [] // 存放全局路由前置守卫函数数组
    this.resolveHooks = [] //存放全局路由解析守卫函数数组
    this.afterHooks = [] //存放全局路由后置钩子函数数组
    //
    this.matcher = createMatcher(options.routes || [], this)
    //
    let mode = options.mode || 'hash'
    switch (mode) {
      case 'history':
        this.history = new HTML5History(this, options.base)
        break
      default:
        if (process.env.NODE_ENV !== 'production') {
          assert(false, `invalid mode: ${mode}`)
        }
    }
  }
  match(location, current, redirectedFrom) {//通过location获取匹配的route
    return this.matcher.match(location, current, redirectedFrom)
  }
  //初始化方法
  init(app) {//app vue根实例
    process.env.NODE_ENV !== 'production' && assert(
      install.installed,
      `not installed. Make sure to call \`Vue.use(VueRouter)\` ` +
      `before creating root instance.`
    )
    this.apps.push(app)
    if (this.app) return
    this.app = app
    const history = this.history
    //初始化时候去匹配更改当前路由
    const onComplete = () => { } //路由跳转成功我们可能需要执行的函数
    const onAbort = () => { } //路由跳转失败我们可能需要执行的函数
    history.transitionTo(history.getCurrentLocation(), onComplete, onAbort)
    //
    history.listen(route => {
      this.apps.forEach((app) => {
        console.log('_route 值改变了', route)
        app._route = route
      })
    })
  }
  // 在$router上暴露这些api, 存储用户定义的守卫函数和一些完成以及过程中报错，想要执行的类型函数
  // https://router.vuejs.org/zh/api/#router-beforeeach
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

  //router-link 组件中用到，获取location-->push-->transitionTo
  resolve(
    to,
    current,
    append
  ) {
    current = current || this.history.current
    const location = normalizeLocation(to, current, append, this)
    return {
      location,
    }
  }
  // 路由守卫从这里开始
  push(location, onComplete, onAbort) {
    if (!onComplete && !onAbort && typeof Promise !== 'undefined') {
      return new Promise((resolve, reject) => {
        this.history.push(location, resolve, reject)
      })
    } else {
      this.history.push(location, onComplete, onAbort)
    }
  }

  replace(location, onComplete, onAbort) {
    if (!onComplete && !onAbort && typeof Promise !== 'undefined') {
      return new Promise((resolve, reject) => {
        this.history.replace(location, resolve, reject)
      })
    } else {
      this.history.replace(location, onComplete, onAbort)
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
VueRouter.install = install
VueRouter.version = '__VERSION__'

if (inBrowser && window.Vue) {
  window.Vue.use(VueRouter)
}