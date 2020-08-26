/* eslint-disable no-prototype-builtins */
import { createRoute } from './util/route'
//import { normalizeLocation } from './util/location'

// routes: [
//   { path: '/', name: 'home', component: Home},
//   { path: '/foo', name: 'foo', component: Foo, alias: '/xxx',meta: {data:666}},
//   { path: '/man/:id', name: 'man', component: Man, props: {aaa:111}  },
// ]
export function createMatcher(

) {

  function match(

  ) {
    return _createRoute()
  }

  function _createRoute() {
    return createRoute(null, {})
  }

  return {
    match,
  }
}

