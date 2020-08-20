/* @flow */

import Regexp from 'path-to-regexp'
import { cleanPath } from './util/path'
import { assert, warn } from './util/warn'

// routes: [
//   { path: '/', name: 'home', component: Home},
//   { path: '/foo', name: 'foo', component: Foo, alias: '/xxx',meta: {data:666}},
//   { path: '/man/:id', name: 'man', component: Man, props: {aaa:111}  },
// ]

export function createRouteMap(
  routes,
  oldPathList,
  oldPathMap,
  oldNameMap
) {
  // pathList 存储所有的 path，
  // pathMap 表示一个 path 到 RouteRecord 的映射关系，
  // nameMap 表示 name 到 RouteRecord 的映射关系
  // the path list is used to control path matching priority
  const pathList = oldPathList || []
  // $flow-disable-line
  const pathMap = oldPathMap || Object.create(null)
  // $flow-disable-line
  const nameMap = oldNameMap || Object.create(null)

  routes.forEach(route => { //{ path: '/', name: 'home', component: Home}
    addRouteRecord(pathList, pathMap, nameMap, route)
  })

  // ensure wildcard routes are always at the end
  // 确保*path总是在最后
  for (let i = 0, l = pathList.length; i < l; i++) {
    if (pathList[i] === '*') {
      pathList.push(pathList.splice(i, 1)[0])
      l--
      i--
    }
  }

  if (process.env.NODE_ENV === 'development') {
    // warn if routes do not include leading slashes
    const found = pathList
      // check for missing leading slash
      .filter(path => path && path.charAt(0) !== '*' && path.charAt(0) !== '/')

    if (found.length > 0) {
      const pathNames = found.map(path => `- ${path}`).join('\n')
      warn(false, `Non-nested routes must include a leading slash character. Fix the following routes: \n${pathNames}`)
    }
  }

  return {
    pathList,
    pathMap,
    nameMap
  }
}

function addRouteRecord(
  pathList,
  pathMap,
  nameMap,
  route, //{ path: '/', name: 'home', component: Home}
  parent,
  matchAs
) {
  const { path, name } = route
  if (process.env.NODE_ENV !== 'production') {
    assert(path != null, `"path" is required in a route configuration.`)
    assert(
      typeof route.component !== 'string',
      `route config "component" for path: ${String(
        path || name
      )} cannot be a ` + `string id. Use an actual component instead.`
    )
  }

  // 编译正则的选项 strict: 严格
  // https://router.vuejs.org/zh/api/#routes
  const pathToRegexpOptions =
    route.pathToRegexpOptions || {}
  const normalizedPath = normalizePath(path, parent, pathToRegexpOptions.strict)

  if (typeof route.caseSensitive === 'boolean') {// 匹配规则是否大小写敏感？(默认值：false)
    pathToRegexpOptions.sensitive = route.caseSensitive
  }

  const record = {
    path: normalizedPath,//标准路径
    regex: compileRouteRegex(normalizedPath, pathToRegexpOptions),//正则表达式
    components: route.components || { default: route.component },
    instances: {},
    name,
    parent,
    matchAs,
    redirect: route.redirect,
    beforeEnter: route.beforeEnter,
    meta: route.meta || {},
    props:
      route.props == null
        ? {}
        : route.components
          ? route.props
          : { default: route.props }
  }

  if (route.children) {
    // Warn if route is named, does not redirect and has a default child route.
    // If users navigate to this route by name, the default child will
    // not be rendered (GH Issue #629)
    if (process.env.NODE_ENV !== 'production') {
      if (//有name=aaa并且没有redirect并且children里的path有 '' 或 '/'(默认路由)
        //那么，直接 to={name:aaa}不会renderchild的默认路由
        route.name &&
        !route.redirect &&
        route.children.some(child => /^\/?$/.test(child.path))
      ) {
        warn(
          false,
          `Named Route '${route.name}' has a default child route. ` +
          `When navigating to this named route (:to="{name: '${
          route.name
          }'"), ` +
          `the default child route will not be rendered. Remove the name from ` +
          `this route and use the name of the default child route for named ` +
          `links instead.`
        )
      }
    }
    route.children.forEach(child => {
      const childMatchAs = matchAs
        ? cleanPath(`${matchAs}/${child.path}`)
        : undefined
      addRouteRecord(pathList, pathMap, nameMap, child, record, childMatchAs)
    })
  }

  if (!pathMap[record.path]) {
    pathList.push(record.path)
    pathMap[record.path] = record
  }

  //  可以设置多个别名，也就是在记录列表中新建一条记录
  if (route.alias !== undefined) {
    const aliases = Array.isArray(route.alias) ? route.alias : [route.alias]
    for (let i = 0; i < aliases.length; ++i) {
      const alias = aliases[i]
      if (process.env.NODE_ENV !== 'production' && alias === path) {
        warn(
          false,
          `Found an alias with the same value as the path: "${path}". You have to remove that alias. It will be ignored in development.`
        )
        // skip in dev to make it work
        continue
      }

      const aliasRoute = {
        path: alias,
        children: route.children
      }
      addRouteRecord(//增加别名路由记录
        pathList,
        pathMap,
        nameMap,
        aliasRoute,
        parent,
        record.path || '/' // matchAs
      )
    }
  }

  if (name) {
    if (!nameMap[name]) {
      nameMap[name] = record
    } else if (process.env.NODE_ENV !== 'production' && !matchAs) {
      warn(
        false,
        `Duplicate named routes definition: ` +
        `{ name: "${name}", path: "${record.path}" }`
      )
    }
  }
}

function compileRouteRegex(
  path,
  pathToRegexpOptions
) {
  const regex = Regexp(path, [], pathToRegexpOptions)
  if (process.env.NODE_ENV !== 'production') {
    const keys = Object.create(null)
    regex.keys.forEach(key => {
      warn(
        !keys[key.name],
        `Duplicate param keys in route with path: "${path}"`
      )
      keys[key.name] = true
    })
  }
  return regex
}

//标准化path /开始说明是绝对path,直接返回，否则有父path要加上父path返回
function normalizePath(
  path,
  parent,
  strict
) {
  if (!strict) path = path.replace(/\/$/, '')//path最后的/是否要去掉
  if (path[0] === '/') return path
  if (parent == null) return path
  return cleanPath(`${parent.path}/${path}`)
}

// //a//b//c --> /a/b/c
// export function cleanPath (path: string): string {
//   return path.replace(/\/\//g, '/')
// }