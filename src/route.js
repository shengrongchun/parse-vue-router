import Foo from './components/Foo'
import Bar from './components/Bar'

export default {
  mode: 'history', // history、hash、abstract(Node.js 环境) 默认是hash
  routes: [
    { path: '/foo', component: Foo },
    { path: '/bar', component: Bar }
  ]
}