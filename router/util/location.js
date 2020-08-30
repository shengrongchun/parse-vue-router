
import { extend } from './misc'

export function normalizeLocation(
  raw, // 1: 字符串 2: {path: '/……', query: {}} 3: {name: xxx, params: {}}
) {
  let next = typeof raw === 'string' ? { path: raw } : raw
  // named target
  if (next._normalized) {//标准化后的直接返回
    return next
  } else if (next.name) {
    next = extend({}, raw)
    const params = next.params
    if (params && typeof params === 'object') {
      next.params = extend({}, params)
    }
    return next
  }
  next._normalized = true
  return next
}
