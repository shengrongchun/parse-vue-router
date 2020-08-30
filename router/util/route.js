const trailingSlashRE = /\/?$/

export function createRoute(
  record,
  location,
) {

  const route = { //创建当前路由对象--> this.$route
    name: location.name || (record && record.name),//当前路由的名称，如果有的话
    meta: (record && record.meta) || {},//meta元数据，如果有的话
    path: location.path || '/',//字符串，对应当前路由的路径，总是解析为绝对路径，如 "/foo/bar"
    hash: location.hash || '',//当前路由的 hash 值 (带 #) ，如果没有 hash 值，则为空字符串
    //一个 key/value 对象，表示 URL 查询参数。例如，对于路径 /foo?user=1，
    //则有 $route.query.user == 1，如果没有查询参数，则是个空对象。
    query: {},
    //一个 key/value 对象，包含了动态片段和全匹配片段，如果没有路由参数，就是一个空对象
    params: location.params || {},
    //完成解析后的 URL，包含查询参数和 hash 的完整路径
    // fullPath: getFullPath(location, stringifyQuery),
    //一个数组，包含当前路由的所有嵌套路径片段的路由记录
    matched: record || {}
  }
  //
  return Object.freeze(route)//冻结对象，不让其修改
}

// the starting route that represents the initial state
export const START = createRoute(null, {
  path: '/'
})
//是否相同route
export function isSameRoute(a, b) {
  if (b === START) {
    return a === b
  } else if (!b) {
    return false
  } else if (a.path && b.path) {
    return (
      a.path.replace(trailingSlashRE, '') === b.path.replace(trailingSlashRE, '')
    )
  } else if (a.name && b.name) {
    return (
      a.name === b.name &&
      a.hash === b.hash
    )
  } else {
    return false
  }
}
