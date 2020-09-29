import Regexp from 'path-to-regexp'
import { cleanPath } from './util/path'
import { assert, warn } from './util/warn'
//
export function createRouteMap(
  routes, //传来的路由配置信息
) {
  const pathList = [] //创建空数组
  const pathMap = Object.create(null)//创建空对象
  const nameMap = Object.create(null)//创建空对象
  //遍历 routes 把 route 相关信息放入 pathList, pathMap, nameMap
  routes.forEach(route => {
    addRouteRecord(pathList, pathMap, nameMap, route)
  })
  // https://router.vuejs.org/zh/guide/essentials/dynamic-matching.html#%E6%8D%95%E8%8E%B7%E6%89%80%E6%9C%89%E8%B7%AF%E7%94%B1%E6%88%96-404-not-found-%E8%B7%AF%E7%94%B1
  // ensure wildcard routes are always at the end
  // 如果定义了path=*确保*的path放在pathList的最后,当通过path没有匹配到任何record，则在正则匹配的时候，*是永远匹配上的
  // https://router.vuejs.org/zh/guide/essentials/dynamic-matching.html#%E5%8C%B9%E9%85%8D%E4%BC%98%E5%85%88%E7%BA%A7
  for (let i = 0, l = pathList.length; i < l; i++) {
    if (pathList[i] === '*') {
      pathList.push(pathList.splice(i, 1)[0])
      l--
      i--
    }
  }
  if (process.env.NODE_ENV === 'development') {//非生产环境，path不是已 *或者/开头会警告
    // warn if routes do not include leading slashes
    const found = pathList
      // check for missing leading slash
      .filter(path => path && path.charAt(0) !== '*' && path.charAt(0) !== '/')

    if (found.length > 0) {
      const pathNames = found.map(path => `- ${path}`).join('\n')
      warn(false, `Non-nested routes must include a leading slash character. Fix the following routes: \n${pathNames}`)
    }
  }
  //
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
  route,
  parent,
  matchAs //是什么path的别名路由
) {
  const { path, name } = route
  if (process.env.NODE_ENV !== 'production') {//非生产环境警告，配置信息path是必须的
    assert(path != null, `"path" is required in a route configuration.`)
    assert(//非生产环境警告，component不能是字符串，必须是一个真实的组件
      typeof route.component !== 'string',
      `route config "component" for path: ${String(
        path || name
      )} cannot be a ` + `string id. Use an actual component instead.`
    )
  }
  //https://router.vuejs.org/zh/api/#router-%E6%9E%84%E5%BB%BA%E9%80%89%E9%A1%B9
  const pathToRegexpOptions = //正则配置 options
    route.pathToRegexpOptions || {}
  //标准化path
  const normalizedPath = normalizePath(path, parent, pathToRegexpOptions.strict)
  if (typeof route.caseSensitive === 'boolean') {// 正则匹配规则是否大小写敏感？(默认值：false)
    pathToRegexpOptions.sensitive = route.caseSensitive
  }
  const record = {
    path: normalizedPath,
    regex: compileRouteRegex(normalizedPath, pathToRegexpOptions),
    components: route.components || { default: route.component },
    instances: {}, // components对应的实例
    name,
    parent,
    matchAs,//是什么path的别名路由
    redirect: route.redirect, // 有重定向参数
    beforeEnter: route.beforeEnter, //路由配置里定义的 beforeEnter
    meta: route.meta || {},
    props: //路由组件传参 有了这个功能，组件可以不再和$route耦合
      route.props == null
        ? {}
        : route.components
          ? route.props
          : { default: route.props } //非多组件的情况下，就是对默认组件的设置
  }
  // **嵌套路由**
  if (route.children) {
    // Warn if route is named, does not redirect and has a default child route.
    // If users navigate to this route by name, the default child will
    // not be rendered (GH Issue #629)
    if (process.env.NODE_ENV !== 'production') {
      if (
        route.name &&
        !route.redirect &&
        route.children.some(child => /^\/?$/.test(child.path))
      ) {
        warn(
          false,
          `Named Route '${route.name}' has a default child route. ` +
          `When navigating to this named route (:to="{name: '${route.name
          }'"), ` +
          `the default child route will not be rendered. Remove the name from ` +
          `this route and use the name of the default child route for named ` +
          `links instead.`
        )
      }
    }
    route.children.forEach(child => {//这里当前的record就是下一层的parent
      //子集是谁的别名，要带上父级的path
      const childMatchAs = matchAs
        ? cleanPath(`${matchAs}/${child.path}`)
        : undefined
      addRouteRecord(pathList, pathMap, nameMap, child, record, childMatchAs)
    })
  }
  //去掉重复的path定义
  if (!pathMap[record.path]) {
    pathList.push(record.path)
    pathMap[record.path] = record
  }
  //如果有别名
  if (route.alias !== undefined) {// 别名可以通过数组传入多个别名
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
      //别名就是以 （有别名的route）创建新记录
      const aliasRoute = {
        path: alias,
        children: route.children
      }
      addRouteRecord(//创建路由记录
        pathList,
        pathMap,
        nameMap,
        aliasRoute,
        parent,
        record.path || '/' // matchAs 谁的别名
      )
    }
  }
  //
  if (name) {
    if (!nameMap[name]) {
      nameMap[name] = record
    } else if (process.env.NODE_ENV !== 'production') {
      warn(//非生产环境警告，配置信息name不能重复
        false,
        `Duplicate named routes definition: ` +
        `{ name: "${name}", path: "${record.path}" }`
      )
    }
  }
}
//path: /man/:id
//regex.keys: [{name: id,optional: false……}]
function compileRouteRegex(
  path,
  pathToRegexpOptions
) {
  const regex = Regexp(path, [], pathToRegexpOptions)
  if (process.env.NODE_ENV !== 'production') {
    const keys = Object.create(null)
    regex.keys.forEach(key => {
      warn(// 比如这样的/man/:id/:id会发出警告
        !keys[key.name],
        `Duplicate param keys in route with path: "${path}"`
      )
      keys[key.name] = true
    })
  }
  return regex
}
// 标准化path
function normalizePath(
  path,
  parent,
  strict
) {
  if (!strict) path = path.replace(/\/$/, '') // 非严格模式会去掉path最后的 /
  if (path[0] === '/') return path
  if (parent == null) return path
  return cleanPath(`${parent.path}/${path}`)
}