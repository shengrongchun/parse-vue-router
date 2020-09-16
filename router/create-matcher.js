/* eslint-disable no-prototype-builtins */
import { warn } from './util/warn'
import { createRoute } from './util/route'
import { fillParams } from './util/params'
import { normalizeLocation } from './util/location'
import { createRouteMap } from './create-route-map'

export function createMatcher(
  routes,
  router
) {
  const { pathList, pathMap, nameMap } = createRouteMap(routes)
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
      //通过正则来收集动态path参数名 如： /a/:username/:userid   paramNames: [username, userid]
      const paramNames = record.regex.keys
        .filter(key => !key.optional)
        .map(key => key.name)
      //
      if (typeof location.params !== 'object') {// params 不是对象就设置成空对象
        location.params = {}
      }
      //如果location的params里面没有如username, userid，那么看看当前路由上的params有没有，有就加进来。
      if (currentRoute && typeof currentRoute.params === 'object') {
        for (const key in currentRoute.params) {
          if (!(key in location.params) && paramNames.indexOf(key) > -1) {
            location.params[key] = currentRoute.params[key]
          }
        }
      }
      // 把params填充到path，如record.path: /a/:username/:userid; params: {username:vue,userid:router};
      //那么最终的path: /a/vue/router
      location.path = fillParams(record.path, location.params, `named route "${name}"`)
      return _createRoute(record, location)
    } else if (location.path) {
      location.params = {} // 这句代码，让在有path的时候无视了params
      // 动态路由这里需要改造 直接的pathMap[location.path]是获取不到 record的
      // 如：pathMap:{ '/man/:id': record } location.path: /man/123
      // 我们可以轮询pathMap里的record ,通过record.regex来匹配 location.path，如果匹配上就获取到了匹配的record
      // 当然这里是会获取最先匹配上的 即使：pathMap: { '/man/:id': record1, '/man/:user': record2 } 
      // location.path: /man/123 只会匹配到 record1
      for (let i = 0; i < pathList.length; i++) {
        const path = pathList[i]
        const record = pathMap[path]
        if (matchRoute(record.regex, location.path, location.params)) {
          return _createRoute(record, location)
        }
      }
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
      // path中如果有*；key.name:0 的情况，path: /man-* , push({path: '/man-pathM'}) --> params.pathMatch = pathM
      params[key.name || 'pathMatch'] = val
    }
  }
  return true
}