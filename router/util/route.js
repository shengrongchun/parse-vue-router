import { stringifyQuery } from './query'
import { assert } from './warn'

const trailingSlashRE = /\/?$/

export function createRoute(
  record,
  location,
  redirectedFrom, //从哪里重定向
  router
) {
  //如果配置项中有字符串化query就使用自定义的
  const stringifyQuery = router && router.options.stringifyQuery
  //
  let query = location.query || {}
  try {
    query = clone(query)
  } catch (e) {
    assert(false, 'clone 报错')
  }
  const route = { //创建当前路由对象--> this.$route
    name: location.name || (record && record.name),//当前路由的名称，如果有的话
    meta: (record && record.meta) || {},//meta元数据，如果有的话
    path: location.path || '/',//字符串，对应当前路由的路径，总是解析为绝对路径，如 "/foo/bar"
    hash: location.hash || '',//当前路由的 hash 值 (带 #) ，如果没有 hash 值，则为空字符串
    //一个 key/value 对象，表示 URL 查询参数。例如，对于路径 /foo?user=1，
    //则有 $route.query.user == 1，如果没有查询参数，则是个空对象。
    query,
    //一个 key/value 对象，包含了动态片段和全匹配片段，如果没有路由参数，就是一个空对象
    params: location.params || {},
    //完成解析后的 URL，包含查询参数和 hash 的完整路径
    fullPath: getFullPath(location, stringifyQuery),
    //一个数组，包含当前路由的所有嵌套路径片段的路由记录
    matched: record ? formatMatch(record) : []
  }
  if (redirectedFrom) {
    route.redirectedFrom = getFullPath(redirectedFrom, stringifyQuery)
  }
  //
  return Object.freeze(route)//冻结对象，不让其修改
}
//
function clone(value) {
  if (Array.isArray(value)) {
    return value.map(clone)
  } else if (value && typeof value === 'object') {
    const res = {}
    for (const key in value) {
      res[key] = clone(value[key])
    }
    return res
  } else {
    return value
  }
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
//获取完整路径包括：path query hash
function getFullPath(
  { path, query = {}, hash = '' },
  _stringifyQuery
) {
  const stringify = _stringifyQuery || stringifyQuery
  return (path || '/') + stringify(query) + hash
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
