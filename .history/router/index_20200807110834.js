import { inBrowser } from './util/dom'
import { install } from './install'

export default class VueRouter {
  constructor(options) {
      this.history = {
        
      }
  }
}
//
VueRouter.install = install
VueRouter.version = '__VERSION__'

if (inBrowser && window.Vue) {
  window.Vue.use(VueRouter)
}