import { parsePath, resolvePath } from './path'
import { resolveQuery } from './query'
import { fillParams } from './params'
import { warn } from './warn'
import { extend } from './misc'

// raw的可能性
// 1：字符串如：/pathname?search=123#hash=111
// 2：对象如： {path: '/……', query: {}} 
// 3: {name: xxx, params: {}, query: {}}
export function normalizeLocation(
  raw,
  current,
  append,
  router
) {
  // 字符串类型直接当做path
  let next = typeof raw === 'string' ? { path: raw } : raw
  // named target
  if (next._normalized) {//有标准化后的标识直接返回,已经normalize了
    return next
  } else if (next.name) { // 如果有name
    // 不希望用户传入的raw和源码内部之间相互影响，所以用了浅copy,raw中没有像对象，数组这样类型的值，所以也就相当于深copy
    next = extend({}, raw)
    const params = next.params
    if (params && typeof params === 'object') {
      next.params = extend({}, params)
    }
    return next
  }

  // relative params 
  //当 push 的location没有path,同时有params和当前路由，会把params追加到当前路由
  if (!next.path && next.params && current) {
    next = extend({}, next)
    next._normalized = true
    const params = extend(extend({}, current.params), next.params)
    if (current.name) {
      next.name = current.name
      next.params = params
    } else if (current.matched.length) {
      //寻找最后一个子路由的path(这里可能你还不理解，等到讲到嵌套路由的时候就明白了)
      const rawPath = current.matched[current.matched.length - 1].path
      // 把params填充到path，如record.path: /a/:username/:userid; params: {username:vue,userid:router};
      // 那么最终的path: /a/vue/router
      next.path = fillParams(rawPath, params, `path ${current.path}`)
    } else if (process.env.NODE_ENV !== 'production') {
      warn(false, `relative params navigation requires a current route.`)
    }
    return next
  }

  //解析 path hash query  主要是path里面是否会解析出hash,query，然后合并
  const parsedPath = parsePath(next.path || '')
  const basePath = (current && current.path) || '/'
  const path = parsedPath.path
    ? resolvePath(parsedPath.path, basePath, append || next.append)
    : basePath

  // ?a=1&b=2 --> {a:1,b:2}
  const query = resolveQuery(
    parsedPath.query, // 在next.path中解析出的query
    next.query, //next自带的query
    router && router.options.parseQuery // route配置中有自带的解析query的方法
  )

  let hash = next.hash || parsedPath.hash
  if (hash && hash.charAt(0) !== '#') {//hash值第一个字符必须是#
    hash = `#${hash}`
  }

  return {
    _normalized: true,
    path,
    query,
    hash
  }
}
