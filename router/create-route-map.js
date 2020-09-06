
import { cleanPath } from './util/path'
import { assert, warn } from './util/warn'

export function createRouteMap(
  routes
) {
  const pathList = []
  const pathMap = Object.create(null)
  const nameMap = Object.create(null)

  routes.forEach(route => {
    addRouteRecord(pathList, pathMap, nameMap, route)
  })
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
  const pathToRegexpOptions =
    route.pathToRegexpOptions || {}
  const normalizedPath = normalizePath(path, null, pathToRegexpOptions.strict)


  const record = {
    path: normalizedPath,
    components: route.components || { default: route.component },
    name,
    meta: route.meta || {},
  }

  if (!pathMap[record.path]) {
    pathList.push(record.path)
    pathMap[record.path] = record
  }

  if (name) {
    if (!nameMap[name]) {
      nameMap[name] = record
    } else if (process.env.NODE_ENV !== 'production') {
      warn(
        false,
        `Duplicate named routes definition: ` +
        `{ name: "${name}", path: "${record.path}" }`
      )
    }
  }
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
