import { parsePath } from './path'
import { extend } from './misc'
export function normalizeLocation(
  raw,
  //current
) {
  // raw可能是字符串如在url上获取的path,也可能是 <router-link :to={path:/bar,……} /> 的to
  let next = typeof raw === 'string' ? { path: raw } : raw
  if (next._normalized) {//已经有标准化后的标识直接返回
    return next
  } else if (next.name) { // 如果有name
    // 不希望用户传入的raw和源码内部之间相互影响，所以用了浅copy,raw中没有像对象，数组这样类型的值，所以也就相当于深copy
    next = extend({}, raw)
    return next
  }
  //解析 path hash query  主要是path有可能会有hash,query
  const parsedPath = parsePath(next.path || '')
  const path = parsedPath.path
  return {
    _normalized: true,
    path
  }
}