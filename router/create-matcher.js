/* eslint-disable no-prototype-builtins */
import { createRoute } from './util/route'
import { normalizeLocation } from './util/location'
import { createRouteMap } from './create-route-map'

export function createMatcher(
  routes,
  router
) {
  // createRouteMap先不需要知道是什么，只要知道他返回了 pathList, pathMap, nameMap
  const { pathList, pathMap, nameMap } = createRouteMap(routes)
  console.log('pathList', pathList)
  console.log('pathMap', pathMap)
  console.log('nameMap', nameMap)
  //
  function match(
    raw,
    currentRoute
  ) {
    const location = normalizeLocation(raw, currentRoute, false, router)
    const { name, path } = location
    console.log('path', path)
    if (name) {
      const record = nameMap[name]
      return _createRoute(record, location)
    } else if (path) {
      //注意：pathMap只会有 '':  没有 '/':
      const record = pathMap[path === '/' ? '' : path]
      return _createRoute(record, location)
    }
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
    match
  }
}

