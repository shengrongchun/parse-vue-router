import { stringifyQuery } from './query'
export function createRoute(
  record,
  location,
  redirectedFrom,
  router //vueRouter 实例对象
) {
  // 怎么字符串化 query 可以在用户路由配置数据中自定义
  // 官方说明：https://router.vuejs.org/zh/api/#parsequery-stringifyquery
  const stringifyQuery = router && router.options.stringifyQuery
  //
  let query = location.query || {}
  try {
    query = clone(query) // clone方法在下面有定义
    // eslint-disable-next-line no-empty
  } catch (e) { }
  //
  const route = {
    name: location.name || (record && record.name),//当前路由的名称，如果有的话
    meta: (record && record.meta) || {},//meta元数据，如果有的话
    //字符串，对应当前路由的路径，总是解析为绝对路径，如 "/foo/bar"
    path: location.path || '/',
    hash: location.hash || '',//当前路由的 hash 值 (带 #) ，如果没有 hash 值，则为空字符串
    //一个 key/value 对象，表示 URL 查询参数。例如，对于路径 /foo?user=1，
    //则有 $route.query.user == 1，如果没有查询参数，则是个空对象。
    query,
    //一个 key/value 对象，包含了动态片段和全匹配片段，如果没有路由参数，就是一个空对象
    params: location.params || {},
    //包含查询参数和 hash 的完整路径
    fullPath: getFullPath(location, stringifyQuery),//getFullPath方法在下面有定义
    //一个数组，包含当前路由的所有嵌套路径片段的路由记录
    matched: record ? formatMatch(record) : []
  }
  if (redirectedFrom) {
    route.redirectedFrom = getFullPath(redirectedFrom, stringifyQuery)
  }
  //
  return Object.freeze(route)//冻结对象，不让其修改
}
// the starting route that represents the initial state
export const START = createRoute(null, {
  path: '/'
})
//
function clone(value) {//递归克隆
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
  const stringify = _stringifyQuery || stringifyQuery//如果没有自定义，使用默认的
  return (path || '/') + stringify(query) + hash
}