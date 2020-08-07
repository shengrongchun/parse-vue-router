const Foo = { template: '<div>foo</div>' }
const Bar = { template: '<div>bar</div>' }

export default {
  routes: [ 
    { path: '/foo', component: Foo },
    { path: '/bar', component: Bar }
  ]
}