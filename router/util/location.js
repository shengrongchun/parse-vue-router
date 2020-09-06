import { parsePath, resolvePath } from './path'
import { extend } from './misc'

// raw的可能性
// 1：字符串如：/pathname?search=123#hash=111
// 2：对象如： {path: '/……', query: {}} 3: {name: xxx, params: {}, query: {}}
export function normalizeLocation(
  raw,
  current,
  append
) {
  let next = typeof raw === 'string' ? { path: raw } : raw
  // named target
  if (next._normalized) {//有标准化后的标识直接返回
    return next
  } else if (next.name) { // 如果有name
    next = extend({}, raw)
    return next
  }

  //解析 path hash query  主要是path里面是否会解析出hash,query，然后合并
  const parsedPath = parsePath(next.path || '')
  const basePath = (current && current.path) || '/'
  const path = parsedPath.path
    ? resolvePath(parsedPath.path, basePath, append || next.append)
    : basePath

  return {
    _normalized: true,
    path
  }
}
