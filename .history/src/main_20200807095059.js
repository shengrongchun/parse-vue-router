import Vue from 'vue'
import App from './App.vue'
import VueRouter from '../router/index'
import route from './route'

Vue.config.productionTip = false


const router = new VueRouter(route)

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
