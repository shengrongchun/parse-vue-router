import Foo from './components/Foo'
import Bar from './components/Bar'
import Home from './components/Home'

const scrollBehavior = function (to, from, savedPosition) {
  if (savedPosition) {
    // savedPosition is only available for popstate navigations.
    return savedPosition
  } else {
    const position = {}

    // scroll to anchor by returning the selector
    if (to.hash) {
      position.selector = to.hash

      // specify offset of the element
      if (to.hash === '#anchor2') {
        position.offset = { y: 100 }
      }

      // bypass #1number check
      if (/^#\d/.test(to.hash) || document.querySelector(to.hash)) {
        return position
      }

      // if the returned position is falsy or an empty object,
      // will retain current scroll position.
      return false
    }

    return new Promise(resolve => {
      // check if any matched route config has meta that requires scrolling to top
      if (to.matched.some(m => m.meta.scrollToTop)) {
        // coords will be used if no selector is provided,
        // or if the selector didn't match any element.
        position.x = 0
        position.y = 0
      }

      // wait for the out transition to complete (if necessary)
      this.app.$root.$once('triggerScroll', () => {
        // if the resolved position is falsy or an empty object,
        // will retain current scroll position.
        resolve(position)
      })
    })
  }
}
export default {
  mode: 'history', // history、hash、abstract(Node.js 环境) 默认是hash
  scrollBehavior,
  routes: [
    {
      path: '/', name: 'Home', component: Home,
      props: true,
      meta: { scrollToTop: true }
    },
    {
      path: '/foo', name: 'Foo', component: Foo,
      props: { name: '对象类型' },
      beforeEnter: (to, from, next) => {
        // ...
        console.log('路由配置 /foo beforeEnter')
        next()
      }
    },
    {
      path: '/bar', name: 'Bar', component: Bar, alias: '/alias-bar',
      props: (route) => {
        return { name: route.query.name }
      },
      meta: { scrollToTop: true }
    },

  ]
}