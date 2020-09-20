import Regexp from 'path-to-regexp'
import { cleanPath } from './util/path'
import { assert, warn } from './util/warn'
//
export function createRouteMap(
  routes
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
    name,
    parent,
    redirect: route.redirect, // 有重定向参数
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
    route.children.forEach(child => {//这里当前的record就是下一层的parent
      addRouteRecord(pathList, pathMap, nameMap, child, record)
    })
  }
  //去掉重复的path定义
  if (!pathMap[record.path]) {
    pathList.push(record.path)
    pathMap[record.path] = record
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