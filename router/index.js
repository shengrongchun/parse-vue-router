import { inBrowser } from './util/dom'
import { install } from './install'
import { History } from './history/base'

export default class VueRouter {
  constructor(options) {
    //
    this.history = new History(this, options.base)
  }
}
//
VueRouter.install = install
VueRouter.version = '__VERSION__'

if (inBrowser && window.Vue) {
  window.Vue.use(VueRouter)
}