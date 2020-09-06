import Home from './components/Home'
import Foo from './components/Foo'
import Bar from './components/Bar'

export default {
  mode: 'history',
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/foo', name: 'foo', component: Foo },
    { path: '/bar', name: 'bar', component: Bar }
  ]
}