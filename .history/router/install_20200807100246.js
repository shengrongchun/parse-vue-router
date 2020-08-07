import View from './components/view'
import Link from './components/link'

export let _Vue

export function install (Vue) {
  //表示路由插件已经安装，无需再次安装，确保install方法只调用一次
  if (install.installed && _Vue === Vue) return
  install.installed = true

  _Vue = Vue

//   const isDef = v => v !== undefined

//   const registerInstance = (vm, callVal) => {
//     let i = vm.$options._parentVnode
//     if (isDef(i) && isDef(i = i.data) && isDef(i = i.registerRouteInstance)) {
//       i(vm, callVal)
//     }
//   }

//   Vue.mixin({
//     beforeCreate () {
//       // 这里判断如果this.$options.router为true,说明this这个vue实例是最外层(根)实例
//       // new Vue({
//       //   router,
//       //   render: h => h(App),
//       // }).$mount('#app')
//       if (isDef(this.$options.router)) {
//         this._routerRoot = this //根实例
//         this._router = this.$options.router
//         this._router.init(this)
//         // this._route = this._router.history.current
//         Vue.util.defineReactive(this, '_route', this._router.history.current)
//       } else {
//         this._routerRoot = (this.$parent && this.$parent._routerRoot) || this
//       }
//       registerInstance(this, this)
//     },
//     destroyed () {
//       registerInstance(this)
//     }
//   })

//   Object.defineProperty(Vue.prototype, '$router', {
//     get () { return this._routerRoot._router }
//   })

//   Object.defineProperty(Vue.prototype, '$route', {
//     get () { return this._routerRoot._route }
//   })

  Vue.component('RouterView', View)
  Vue.component('RouterLink', Link)
}
