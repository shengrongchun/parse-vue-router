import View from './components/view'
import Link from './components/link'

export let _Vue //这里暴露Vue,其他地方可以直接引用，无需再次 import vue from 'vue'

export function install(Vue) {
  //表示路由插件已经安装，无需再次安装，确保install方法只调用一次
  if (install.installed && _Vue === Vue) return
  install.installed = true

  _Vue = Vue

  const isDef = v => v !== undefined
  const registerInstance = (vm, callVal) => {
    let i = vm.$options._parentVnode
    if (isDef(i) && isDef(i = i.data) && isDef(i = i.registerRouteInstance)) {
      i(vm, callVal)
    }
  }
  // vue在每个实例中挂载一个属性_routerRoot
  Vue.mixin({
    beforeCreate() {
      if (isDef(this.$options.router)) {//根实例
        this._routerRoot = this
        this._router = this.$options.router
        //这里需要初始化，设置当前路由route的信息，初始化方法放在了this._router(new VueRouter)上
        //因为当前路由current放在了this._router.history
        this._router.init(this) // this根实例
        Vue.util.defineReactive(this, '_route', this._router.history.current)
      } else {//其他子实例
        this._routerRoot = (this.$parent && this.$parent._routerRoot) || this
      }
      //添加实例
      registerInstance(this, this)
    },
    destroyed() {//销毁实例
      registerInstance(this)
    }
  })

  //原型上定义了 $router 怎么在每个实例this中获取到app.$options.router值呢？
  //因此我们需要在每个实例上挂载一个属性如_routerRoot --> app
  Object.defineProperty(Vue.prototype, '$router', {
    get() {
      return this._routerRoot._router
    }
  })
  //
  Object.defineProperty(Vue.prototype, '$route', {
    get() {
      return this._routerRoot._route
    }
  })
  //注册全局组件
  Vue.component('RouterView', View)
  Vue.component('RouterLink', Link)

  //这里是定义了，在组件中mixin和vue.extend 相关hooks时候的合并策略，同created一样
  const strats = Vue.config.optionMergeStrategies
  // use the same hook merging strategy for route hooks
  strats.beforeRouteEnter = strats.beforeRouteLeave = strats.beforeRouteUpdate = strats.created
}
