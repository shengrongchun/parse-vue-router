import Foo from './components/Foo'
import Bar from './components/Bar'
import Home from './components/Home'

export default {
  mode: 'history', // history、hash、abstract(Node.js 环境) 默认是hash
  routes: [
    {
      path: '/', name: 'Home', component: Home,
      children: [{
        path: 'foo', component: Foo,
        children: [{
          path: 'bar', component: Bar
        }]
      }]
    },
    // { path: '/:foo', name: 'Foo', component: Foo },
    // { path: '/:foo/:bar', name: 'Bar', component: Bar },

  ]
}