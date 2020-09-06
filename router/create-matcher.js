import { createRoute } from './util/route'
import { normalizeLocation } from './util/location'
import { createRouteMap } from './create-route-map'

// routes: [
//   { path: '/', name: 'home', component: Home },
//   { path: '/foo', name: 'foo', component: Foo },
//   { path: '/bar', name: 'bar', component: Bar }
// ]

// pathMap
// {
//   '': {
//     path: '',
//     name: 'home',
//     meta: {},
//     components: {default: Home }
//   },
//   '/foo': {
//     path: '/foo',
//     name: 'foo',
//     meta: {},
//     components: {default: Foo }
//   },
//   '/bar': {
//     path: '/bar',
//     name: 'bar',
//     meta: {},
//     components: {default: Bar }
//   }
// }
// nameMap
// {
//   'home': {
//     path: '',
//     name: 'home',
//     meta: {},
//     components: {default: Home }
//   },
//   'foo': {
//     path: '/foo',
//     name: 'foo',
//     meta: {},
//     components: {default: Foo }
//   },
//   'bar': {
//     path: '/bar',
//     name: 'bar',
//     meta: {},
//     components: {default: Bar }
//   }
// }
//通过当前location创建当前路由
export function createMatcher(
  routes,
) {
  const { pathMap, nameMap } = createRouteMap(routes)
  console.log('pathMap', pathMap)
  console.log('nameMap', nameMap)

  function match(
    raw,
    currentRoute,
  ) {
    const location = normalizeLocation(raw, currentRoute, false)
    const { name } = location
    if (name) {
      const record = nameMap[name]
      return _createRoute(record, location)
    } else if (location.path) {
      const record = pathMap[location.path === '/' ? '' : location.path]
      return _createRoute(record, location)
    }
    // no match
    return _createRoute(null, location)
  }
  //
  function _createRoute(
    record,
    location,
  ) {
    return createRoute(record, location)
  }
  //
  return {
    match,
  }
}
