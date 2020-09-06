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
  match(location, current) {//通过location获取匹配的route
    return this.matcher.match(location, current)
  }
  //初始化方法
  init(app) {//app vue根实例
    this.apps.push(app)
    if (this.app) return
    this.app = app
    const history = this.history
    //初始化时候去匹配更改当前路由
    history.transitionTo(history.getCurrentLocation(), () => { })
    //
    history.listen(route => {
      this.apps.forEach((app) => {
        console.log('_route 值改变了', route)
        app._route = route
      })
    })
  }
  //router-link 组件中用到，获取location-->push-->transitionTo
  resolve(
    to,
    current,
    append
  ) {
    current = current || this.history.current
    const location = normalizeLocation(to, current, append)
    return {
      location,
    }
  }

  push(location) {
    this.history.push(location)
  }

  replace(location) {
    this.history.replace(location)
  }
}
//
VueRouter.install = install
VueRouter.version = '__VERSION__'

if (inBrowser && window.Vue) {
  window.Vue.use(VueRouter)
}