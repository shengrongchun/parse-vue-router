
import { _Vue } from '../install'
import { inBrowser } from '../util/dom'
import { runQueue } from '../util/async'
import { warn, isError, isRouterError } from '../util/warn'
import { START, isSameRoute } from '../util/route'
import {
  flatten,
  flatMapComponents,
  resolveAsyncComponents
} from '../util/resolve-components'
import {
  createNavigationDuplicatedError,
  createNavigationCancelledError,
  createNavigationRedirectedError,
  createNavigationAbortedError,
  NavigationFailureType
} from './errors'
export class History {
  constructor(router, base) {
    //路由实例对象
    this.router = router //$router
    //基本路径
    this.base = normalizeBase(base)
    //当前路由
    this.current = START
    //要导航的路由
    this.pending = null
    //
    this.ready = false //是否执行完成ready的标识
    this.readyCbs = [] //存放read后要执行的函数
    this.readyErrorCbs = [] //存放ready失败后要执行的函数
    this.errorCbs = [] //存放有错误发生后要执行的函数
    //存储一些监听事件
    this.listeners = []
  }
  //
  listen(cb) {
    this.cb = cb
  }
  onReady(cb, errorCb) {
    if (this.ready) {
      cb()
    } else {
      this.readyCbs.push(cb)
      if (errorCb) {
        this.readyErrorCbs.push(errorCb)
      }
    }
  }
  onError(errorCb) {
    this.errorCbs.push(errorCb)
  }
  //创建匹配的路由，然后改变当前路由
  transitionTo(location, onComplete, onAbort) {
    //新匹配创建的route
    let route
    try {
      //可能会产生错误
      route = this.router.match(location, this.current)
    } catch (e) {
      this.errorCbs.forEach(cb => {
        cb(e)
      })
      // Exception should still be thrown
      throw e
    }
    this.confirmTransition(route, () => {//成功后
      const prev = this.current
      this.updateRoute(route)
      onComplete && onComplete(route)
      // 这里改变url地址
      this.ensureURL()
      //
      this.router.afterHooks.forEach(hook => {
        hook && hook(route, prev)
      })
      // fire ready cbs once
      if (!this.ready) {
        this.ready = true
        this.readyCbs.forEach(cb => {
          cb(route)
        })
      }
    }, (err) => {//失败后
      if (onAbort) {
        onAbort(err)
      }
      if (err && !this.ready) {
        this.ready = true
        // Initial redirection should still trigger the onReady onSuccess
        // https://github.com/vuejs/vue-router/issues/3225
        if (!isRouterError(err, NavigationFailureType.redirected)) {
          this.readyErrorCbs.forEach(cb => {
            cb(err)
          })
        } else {
          this.readyCbs.forEach(cb => {
            cb(route)
          })
        }
      }
    })
  }
  //
  confirmTransition(route, onComplete, onAbort) {
    const current = this.current
    const abort = err => {
      // changed after adding errors with
      // https://github.com/vuejs/vue-router/pull/3047 before that change,
      // redirect and aborted navigation would produce an err == null
      if (!isRouterError(err) && isError(err)) {//是个错误但不是路由错误
        if (this.errorCbs.length) {
          this.errorCbs.forEach(cb => {
            cb(err)
          })
        } else {
          warn(false, 'uncaught error during route navigation:')
          console.error(err)
        }
      }
      onAbort && onAbort(err)
    }
    //怎么比较才算是相同的路由和视图：routeA：[view,subView,subSubView……]
    // 在 isSameRoute(route, current)的提前下
    // routeB的length和routeA一样，并且最后一个view也一样
    const lastRouteIndex = route.matched.length - 1
    const lastCurrentIndex = current.matched.length - 1
    if (
      isSameRoute(route, current) &&
      // in the case the route map has been dynamically appended to
      lastRouteIndex === lastCurrentIndex &&
      route.matched[lastRouteIndex] === current.matched[lastCurrentIndex]
    ) {
      this.ensureURL()//确保当前路由的path和url保持一致
      //执行未跳转成功操作，执行相关类型的函数
      return abort(createNavigationDuplicatedError(current, route))
    }
    const { updated, deactivated, activated } = resolveQueue(
      this.current.matched,
      route.matched
    )
    //https://router.vuejs.org/zh/guide/advanced/navigation-guards.html
    //可以看下完整的导航解析流程顺序
    const queue = [].concat(
      // in-component leave guards
      extractLeaveGuards(deactivated), // beforeRouteLeave 
      // global before hooks
      this.router.beforeHooks, // beforeEach
      // in-component update hooks
      extractUpdateHooks(updated), // beforeRouteUpdate
      // in-config enter guards
      activated.map(m => m.beforeEnter), // 这里调路由配置里定义的 beforeEnter
      // async components
      resolveAsyncComponents(activated) //解析异步路由组件
    )
    //queue: [undefined,……,function(to,from,next),……]
    this.pending = route
    // hook: queue[index] next: ()=> {step(index+1)}
    const iterator = (hook, next) => {
      if (this.pending !== route) {
        return abort(createNavigationCancelledError(current, route))
      }
      try {
        hook(route, current, (to) => {//第三个参数相当于我们使用钩子函数时候的next函数
          if (to === false) {
            // next(false) -> abort navigation, ensure current URL
            this.ensureURL(true)
            abort(createNavigationAbortedError(current, route))
          } else if (isError(to)) {
            this.ensureURL(true)
            abort(to)
          } else if (
            typeof to === 'string' ||
            (typeof to === 'object' &&
              (typeof to.path === 'string' || typeof to.name === 'string'))
          ) {
            // next('/') or next({ path: '/' }) -> redirect 重定向
            abort(createNavigationRedirectedError(current, route))
            if (typeof to === 'object' && to.replace) {
              this.replace(to)
            } else {
              this.push(to)
            }
          } else {
            // confirm transition and pass on the value
            next(to)
          }
        })
      } catch (e) {
        abort(e)
      }
    }

    runQueue(queue, iterator, () => {//cb
      const postEnterCbs = []
      const isValid = () => this.current === route
      // wait until async components are resolved before
      // extracting in-component enter guards
      const enterGuards = extractEnterGuards(activated, postEnterCbs, isValid) //在被激活的组件里调用 beforeRouteEnters
      const queue = enterGuards.concat(this.router.resolveHooks)//调用全局的 beforeResolve
      runQueue(queue, iterator, () => {
        if (this.pending !== route) {
          return abort(createNavigationCancelledError(current, route))
        }
        this.pending = null
        onComplete(route)//经历九九81难最终成功导航后执行了这里
        if (this.router.app) {
          this.router.app.$nextTick(() => {//执行用户在beforeRouteEnters自定义的回调函数
            postEnterCbs.forEach(cb => {
              cb()
            })
          })
        }
      })
    })
  }
  //改变当前路由
  updateRoute(route) {
    this.current = route
    this.cb && this.cb(route) // 去改变 实例的_route
  }
  //
  setupListeners() {
    // Default implementation is empty
  }

  teardownListeners() {
    this.listeners.forEach(cleanupListener => {
      cleanupListener()
    })
    this.listeners = []
  }

}
//标准化base
function normalizeBase(base) {
  if (!base) {//没有base
    if (inBrowser) {
      // respect <base> tag
      const baseEl = document.querySelector('base')
      base = (baseEl && baseEl.getAttribute('href')) || '/'
      // strip full URL origin
      // eslint-disable-next-line no-useless-escape
      base = base.replace(/^https?:\/\/[^\/]+/, '')
    } else {
      base = '/'
    }
  }
  // make sure there's the starting slash
  if (base.charAt(0) !== '/') {
    base = '/' + base
  }
  // remove trailing slash // --> /
  return base.replace(/\/$/, '')
}
// 获取更新 激活 停用 record 数组
function resolveQueue(
  current,
  next
) {
  let i
  const max = Math.max(current.length, next.length)
  for (i = 0; i < max; i++) {
    if (current[i] !== next[i]) {
      break
    }
  }
  return {
    updated: next.slice(0, i), //更新 record 数组
    activated: next.slice(i), //激活 record 数组
    deactivated: current.slice(i)//停用 record数组
  }
}

function extractGuards(
  records,
  name,
  bind,
  reverse //离开钩子应该是子到父的执行顺序，所以要倒序，而更新钩子是父到子的顺序
) {
  // def：组件component; instance: 组件实例this; match: record; key: 如default
  const guards = flatMapComponents(records, (def, instance, match, key) => {
    const guard = extractGuard(def, name) // 匹配组件是否有如beforeRouteLeave等这样的函数，有返回这样的函数
    if (guard) {
      return Array.isArray(guard) //如果是数组相当于在页面定义多个相同钩子
        ? guard.map(guard => bind(guard, instance, match, key))
        : bind(guard, instance, match, key)
    }
  })
  return flatten(reverse ? guards.reverse() : guards)
}
function extractGuard( // 返回如beforeRouteLeave等这样的函数
  def,
  key
) {
  if (typeof def !== 'function') {
    // extend now so that global mixins are applied.
    def = _Vue.extend(def)
  }
  return def.options[key]
}
function extractLeaveGuards(deactivated) {//离开 true参数是离开beforeRouteLeave是从里往外离开，最里面，数组上也就是最后面最先执行
  return extractGuards(deactivated, 'beforeRouteLeave', bindGuard, true)
}

function extractUpdateHooks(updated) {//更新
  return extractGuards(updated, 'beforeRouteUpdate', bindGuard)
}

function bindGuard(guard, instance) {
  if (instance) {
    return function boundRouteGuard() {//返回执行beforeRouteLeave函数的函数，把这些函数放入queue中等待执行
      return guard.apply(instance, arguments)
    }
  }
}
function extractEnterGuards(
  activated,
  cbs,
  isValid
) {
  return extractGuards(
    activated,
    'beforeRouteEnter',
    (guard, _, match, key) => {
      return bindEnterGuard(guard, match, key, cbs, isValid)
    }
  )
}
function bindEnterGuard(
  guard,
  match,
  key,
  cbs,
  isValid
) {
  return function routeEnterGuard(to, from, next) {
    return guard(to, from, cb => {
      if (typeof cb === 'function') {
        cbs.push(() => {
          // #750
          // if a router-view is wrapped with an out-in transition,
          // the instance may not have been registered at this time.
          // we will need to poll for registration until current route
          // is no longer valid.
          poll(cb, match.instances, key, isValid)
        })
      }
      next(cb)
    })
  }
}
function poll(
  cb, // somehow flow cannot infer this is a function
  instances,
  key,
  isValid
) {
  if (
    instances[key] &&
    !instances[key]._isBeingDestroyed // do not reuse being destroyed instance
  ) {
    cb(instances[key])
  } else if (isValid()) {
    setTimeout(() => {
      poll(cb, instances, key, isValid)
    }, 16)
  }
}