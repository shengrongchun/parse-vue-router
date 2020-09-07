import { resolvePath } from './util/path'
import { assert, warn } from './util/warn'
import { createRoute } from './util/route'
import { fillParams } from './util/params'
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
    const location = normalizeLocation(raw, currentRoute, false, router)
    const { name } = location
    if (name) {
      const record = nameMap[name]
      if (process.env.NODE_ENV !== 'production') {
        warn(record, `Route with name '${name}' does not exist`)
      }
      if (!record) return _createRoute(null, location)
      //通过正则来收集path应当的参数 如： /a/:username/:userid   paramNames: [username, userid]
      const paramNames = record.regex.keys
        .filter(key => !key.optional)
        .map(key => key.name)
      if (typeof location.params !== 'object') {
        location.params = {}
      }
      // 把currentRoute的符合规则的参数放入location.params中
      if (currentRoute && typeof currentRoute.params === 'object') {
        for (const key in currentRoute.params) {
          if (!(key in location.params) && paramNames.indexOf(key) > -1) {
            location.params[key] = currentRoute.params[key]
          }
        }
      }
      // 把params填充到path
      location.path = fillParams(record.path, location.params, `named route "${name}"`)
      return _createRoute(record, location, redirectedFrom)
    } else if (location.path) {
      location.params = {} // 这句代码，让在有path的时候无视了params
      //动态路由这里需要改造 直接的pathMap[location.path]是获取不到的
      //如：pathMap: {'/man/:id':record} location.path: /man/123
      // 我们可以轮询pathMap里的record ,通过record.regex来匹配 location.path，如果匹配上就获取到了匹配的record
      // 当然这里是会获取最先匹配上的 即使：pathMap: {'/man/:id':record1,'/man/:user':record2} location.path: /man/123
      for (let i = 0; i < pathList.length; i++) {
        const path = pathList[i]
        const record = pathMap[path]
        if (matchRoute(record.regex, location.path, location.params)) {
          return _createRoute(record, location, redirectedFrom)
        }
      }
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
    return createRoute(record, location, redirectedFrom, router)
  }
  //
  return {
    match,
  }
}

// path: /man/123/456   regex是通过 /man/:id/:user创建的正则解析对象
// regex.keys: [
//   {
//     asterisk: false
//     delimiter: "/"
//     name: "id"
//     optional: false
//     partial: false
//     pattern: "[^\/]+?"
//     prefix: "/"
//     repeat: false
//   },
//   {
//     asterisk: false
//     delimiter: "/"
//     name: "user"
//     optional: false
//     partial: false
//     pattern: "[^\/]+?"
//     prefix: "/"
//     repeat: false
//   },
// ]
// path.match(regex)：["/man/123/456", "123", "456", index: 0, input: "/man/123/456", ……]
function matchRoute(
  regex,
  path,
  params
) {
  //
  const m = path.match(regex)

  if (!m) {//没有匹配上
    return false
  } else if (!params) { //?
    return true
  }

  for (let i = 1, len = m.length; i < len; ++i) {
    const key = regex.keys[i - 1]
    const val = typeof m[i] === 'string' ? decodeURIComponent(m[i]) : m[i]
    if (key) {
      // Fix #1994: using * with props: true generates a param named 0
      // key.name:0 的情况，path: /man-* , push({path: '/man-pathM'}) --> params.pathMatch = pathM
      params[key.name || 'pathMatch'] = val
    }
  }

  return true
}

function resolveRecordPath(path, record) {
  return resolvePath(path, record.parent ? record.parent.path : '/', true)
}