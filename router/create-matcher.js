import { createRoute } from './util/route'
import { resolvePath } from './util/path'
import { fillParams } from './util/params'
import { normalizeLocation } from './util/location'
import { createRouteMap } from './create-route-map'
import { assert, warn } from './util/warn'

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
  router
) {
  const { pathList, pathMap, nameMap } = createRouteMap(routes)
  console.log('pathList', pathList)
  console.log('pathMap', pathMap)
  console.log('nameMap', nameMap)

  function match(
    raw,
    currentRoute,
    redirectedFrom
  ) {
    const location = normalizeLocation(raw, currentRoute, false)
    const { name } = location
    if (name) {
      const record = nameMap[name]
      return _createRoute(record, location, redirectedFrom)
    } else if (location.path) {
      const record = pathMap[location.path === '/' ? '' : location.path]
      return _createRoute(record, location, redirectedFrom)
    }
    // no match
    return _createRoute(null, location, redirectedFrom)
  }
  //重定向传参数有三种类型：https://router.vuejs.org/zh/guide/essentials/redirect-and-alias.html#%E9%87%8D%E5%AE%9A%E5%90%91
  function redirect(
    record,
    location
  ) {
    const originalRedirect = record.redirect
    let redirect = typeof originalRedirect === 'function'
      ? originalRedirect(createRoute(record, location, null, router)) // redirect(to)
      : originalRedirect

    if (typeof redirect === 'string') {
      redirect = { path: redirect }
    }

    if (!redirect || typeof redirect !== 'object') {
      if (process.env.NODE_ENV !== 'production') {
        warn(
          false, `invalid redirect option: ${JSON.stringify(redirect)}`
        )
      }
      return _createRoute(null, location)
    }

    const re = redirect
    const { name, path } = re
    let { query, hash, params } = location
    query = re.hasOwnProperty('query') ? re.query : query
    hash = re.hasOwnProperty('hash') ? re.hash : hash
    params = re.hasOwnProperty('params') ? re.params : params

    if (name) {
      // resolved named direct
      const targetRecord = nameMap[name]
      if (process.env.NODE_ENV !== 'production') {
        assert(targetRecord, `redirect failed: named route "${name}" not found.`)
      }
      return match({
        _normalized: true,
        name,
        query,
        hash,
        params
      }, undefined, location)
    } else if (path) {
      // 1. resolve relative redirect
      const rawPath = resolveRecordPath(path, record)
      // 2. resolve params
      const resolvedPath = fillParams(rawPath, params, `redirect route with path "${rawPath}"`)
      // 3. rematch with existing query and hash
      return match({
        _normalized: true,
        path: resolvedPath,
        query,
        hash
      }, undefined, location)
    } else {
      if (process.env.NODE_ENV !== 'production') {
        warn(false, `invalid redirect option: ${JSON.stringify(redirect)}`)
      }
      return _createRoute(null, location)
    }
  }
  //
  function alias(
    record,
    location,
    matchAs
  ) {
    const aliasedPath = fillParams(matchAs, location.params, `aliased route with path "${matchAs}"`)
    const aliasedMatch = match({
      _normalized: true,
      path: aliasedPath
    })
    if (aliasedMatch) {
      const matched = aliasedMatch.matched
      const aliasedRecord = matched[matched.length - 1]
      location.params = aliasedMatch.params
      return _createRoute(aliasedRecord, location)
    }
    return _createRoute(null, location)
  }
  //
  function _createRoute(
    record,
    location,
    redirectedFrom
  ) {
    if (record && record.redirect) { // 如果有重定向
      return redirect(record, redirectedFrom || location)
    }
    if (record && record.matchAs) {// 如果有是谁的别名
      return alias(record, location, record.matchAs)
    }
    return createRoute(record, location, redirectedFrom)
  }
  //
  return {
    match,
  }
}


function resolveRecordPath(path, record) {
  return resolvePath(path, record.parent ? record.parent.path : '/', true)
}