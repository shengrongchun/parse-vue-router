
export function createRoute(
  record,
  location
) {
  const route = {
    name: location.name || (record && record.name),//当前路由的名称，如果有的话
    meta: (record && record.meta) || {},//meta元数据，如果有的话
    //字符串，对应当前路由的路径，总是解析为绝对路径，如 "/foo/bar"
    path: location.path || '/',
    //当前路由匹配的组件
    matched: { components: record ? record.components : {} }
  }
  //
  return Object.freeze(route)//冻结对象，不让其修改
}
// the starting route that represents the initial state
export const START = createRoute(null, {
  path: '/'
})