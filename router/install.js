import View from './components/view'
import Link from './components/link'

export let _Vue //这里暴露Vue,其他地方可以直接引用，无需再次 import vue from 'vue'

export function install(Vue) {
  //表示路由插件已经安装，无需再次安装，确保install方法只调用一次
  if (install.installed && _Vue === Vue) return
  install.installed = true

  _Vue = Vue

  const isDef = v => v !== undefined

  // vue想在每个实例中挂载一个属性_routerRoot
  Vue.mixin({
    beforeCreate() {
      //这里的this就是vue实例，每个页面的实例,我们需要为每个实例挂载_router,以便在下面定义的$router
      //可以在this实例中获取，第一步是获取根实例，因为根实例上有 new Router()实例对象
      if (isDef(this.$options.router)) {//根实例
        this._routerRoot = this
        this._router = this.$options.router
        //这里需要初始化，设置当前路由route的信息，初始化方法放在了this._router(new VueRouter)上
        //因为当前路由current放在了this._router.history
        this._router.init(this)
        Vue.util.defineReactive(this, '_route', this._router.history.current)
      } else {//其他子实例
        this._routerRoot = (this.$parent && this.$parent._routerRoot) || this
      }
    }
  })

  //全局定义 $router $route，这里怎么获取呢? 可以在每个实例this上获取吗如 return this._router
  // this.$router --> this._routerRoot._router
  Object.defineProperty(Vue.prototype, '$router', {
    get() {//--> new VueRouter实例 或者 history.router
      return this._routerRoot._router
    }
  })
  // this.$route --> this._routerRoot._route
  Object.defineProperty(Vue.prototype, '$route', {
    get() {//--> history.current
      return this._routerRoot._route
    }
  })


  //注册全局组件
  Vue.component('RouterView', View)
  Vue.component('RouterLink', Link)
}
