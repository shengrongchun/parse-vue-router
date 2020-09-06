const trailingSlashRE = /\/?$/

export function createRoute(
  record,
  location,
  redirectedFrom
) {
  //
  const route = { //创建当前路由对象--> this.$route
    name: location.name || (record && record.name),//当前路由的名称，如果有的话
    meta: (record && record.meta) || {},//meta元数据，如果有的话
    path: location.path || '/',//字符串，对应当前路由的路径，总是解析为绝对路径，如 "/foo/bar"
    //一个数组，包含当前路由的所有嵌套路径片段的路由记录
    matched: record ? formatMatch(record) : []
  }
  if (redirectedFrom) {
    // route.redirectedFrom = getFullPath(redirectedFrom, stringifyQuery)
  }
  //
  return Object.freeze(route)//冻结对象，不让其修改
}
// the starting route that represents the initial state
export const START = createRoute(null, {
  path: '/'
})

//嵌套路由视图
// [父, 子, 子的子……]
function formatMatch(record) {
  const res = []
  while (record) {
    res.unshift(record)
    record = record.parent
  }
  return res
}

//是否相同route
export function isSameRoute(a, b) {
  if (b === START) {
    return a === b
  } else if (!b) {
    return false
  } else if (a.path && b.path) {
    return (
      a.path.replace(trailingSlashRE, '') === b.path.replace(trailingSlashRE, '') &&
      a.hash === b.hash &&
      isObjectEqual(a.query, b.query)
    )
  } else if (a.name && b.name) {
    return (
      a.name === b.name &&
      a.hash === b.hash &&
      isObjectEqual(a.query, b.query) &&
      isObjectEqual(a.params, b.params)
    )
  } else {
    return false
  }
}

function isObjectEqual(a = {}, b = {}) {
  // handle null value #1566
  if (!a || !b) return a === b
  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b)
  if (aKeys.length !== bKeys.length) {
    return false
  }
  return aKeys.every(key => {
    const aVal = a[key]
    const bVal = b[key]
    // query values can be null and undefined
    if (aVal == null || bVal == null) return aVal === bVal
    // check nested equality
    if (typeof aVal === 'object' && typeof bVal === 'object') {
      return isObjectEqual(aVal, bVal)
    }
    return String(aVal) === String(bVal)
  })
}