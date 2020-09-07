import Home from './components/Home'
import Foo from './components/Foo'
import Bar from './components/Bar'
import Man from './components/Man'

export default {
  mode: 'history',
  routes: [
    { path: '/', name: 'home', component: Home, redirect: '/bar' },
    {
      path: '/foo', name: 'foo', component: Foo, children: [{
        path: 'bar',
        component: Bar
      }]
    },
    { path: '/bar', name: 'bar', component: Bar, alias: '/alias-bar' },
    { path: '/man/:id', name: 'man', component: Man }
  ]
}