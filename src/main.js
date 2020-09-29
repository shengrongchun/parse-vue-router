import Vue from 'vue'
import App from './App.vue'
import VueRouter from '../router/index'
import route from './route'

Vue.config.productionTip = false

//
Vue.use(VueRouter)
//VueRouter 是Class
const router = new VueRouter(route)
//
router.beforeEach((to, from, next) => {
  console.log('全局 beforeEach')
  next()
})
router.afterEach(() => {
  console.log('全局 afterEach')
})
//
new Vue({
  router,
  render: h => h(App),
}).$mount('#app')

