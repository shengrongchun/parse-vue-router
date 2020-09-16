/* eslint-disable no-prototype-builtins */
import { createRoute } from './util/route'
import { warn } from './util/warn'
import { normalizeLocation } from './util/location'
import { createRouteMap } from './create-route-map'

export function createMatcher(
  routes,
  router
) {
  const { pathMap, nameMap } = createRouteMap(routes)
  //
  function match(
    raw,
    currentRoute
  ) {
    const location = normalizeLocation(raw, currentRoute, false, router)
    const { name } = location
    if (name) {
      const record = nameMap[name]
      if (process.env.NODE_ENV !== 'production') {//警告 没有发现此name的record
        warn(record, `Route with name '${name}' does not exist`)
      }
      if (!record) return _createRoute(null, location) //没有，直接创建一个默认的route
      if (typeof location.params !== 'object') {// params 不是对象就设置成空对象
        location.params = {}
      }
      return _createRoute(record, location)
    } else if (location.path) {
      location.params = {} // 这句代码，让在有path的时候无视了params
      //注意：pathMap只会有 '':  没有 '/':
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
    match
  }
}

