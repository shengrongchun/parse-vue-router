import { warn } from './util/warn'
import { createRoute } from './util/route'
import { normalizeLocation } from './util/location'
//
import Home from '../src/components/Home'
import Foo from '../src/components/Foo'
import Bar from '../src/components/Bar'
// routes: [
//   { path: '/', name: 'home', component: Home },
//   { path: '/foo', name: 'foo', component: Foo },
//   { path: '/bar', name: 'bar', component: Bar }
// ]
const pathList = ["", "/foo", "/bar"]
const pathMap = {
  '': {//record
    beforeEnter: undefined,
    components: { default: Home },
    instances: {},
    matchAs: undefined,
    meta: {},
    name: 'home',
    parent: undefined,
    path: '',
    props: {},
    redirect: undefined,
    regex: /^(?:\/(?=$))?$/i
  },
  '/foo': {
    beforeEnter: undefined,
    components: { default: Foo },
    instances: {},
    matchAs: undefined,
    meta: {},
    name: 'foo',
    parent: undefined,
    path: '/foo',
    props: {},
    redirect: undefined,
    regex: /^\/foo(?:\/(?=$))?$/i
  },
  '/bar': {
    beforeEnter: undefined,
    components: { default: Bar },
    instances: {},
    matchAs: undefined,
    meta: {},
    name: 'bar',
    parent: undefined,
    path: '/bar',
    props: {},
    redirect: undefined,
    regex: /^\/bar(?:\/(?=$))?$/i
  },
}
const nameMap = { home: pathMap[''], foo: pathMap['/foo'], bar: pathMap['/bar'] }
//通过当前location创建当前路由
export function createMatcher(
  routes,
  router,
  redirectedFrom
) {

  function match(
    raw, // 1: 字符串 2: {path: '/……', query: {}} 3: {name: xxx, params: {}}
    currentRoute
  ) {
    const location = normalizeLocation(raw, currentRoute, false, router) // false--> append
    const { name } = location
    if (name) {
      const record = nameMap[name]
      if (process.env.NODE_ENV !== 'production') {
        warn(record, `Route with name '${name}' does not exist`)
      }
      if (!record) return _createRoute(null, location)
      //通过正则来收集path应当的参数 如： /a:username
      const paramNames = record.regex.keys
        .filter(key => !key.optional)
        .map(key => key.name)

      if (typeof location.params !== 'object') {
        location.params = {}
      }
      // 把currentRoute的符合规则的参数放入location.params中
      if (currentRoute && typeof currentRoute.params === 'object') {
        for (const key in currentRoute.params) {
          if (!(key in location.params) && paramNames.indexOf(key) > -1) {
            location.params[key] = currentRoute.params[key]
          }
        }
      }
      // 把params填充到path
      location.path = fillParams(record.path, location.params, `named route "${name}"`)
      return _createRoute(record, location, redirectedFrom)
    } else if (location.path) {
      // 这里为什么for循环而不直接 pathMap[path]
      //因为location.path可能带参数 如/bar?a=123
      for (let i = 0; i < pathList.length; i++) {
        const path = pathList[i]
        const record = pathMap[path]

        if (matchRoute(record.regex, location.path)) {
          return _createRoute(record, location, redirectedFrom)
        }
      }
    }
    // no match
    return _createRoute(null, location)
  }

  function _createRoute(
    record,
    location,
    redirectedFrom
  ) {
    return createRoute(record, location, redirectedFrom)
  }

  return {
    match,
  }
}

function matchRoute(
  regex,
  path,
) {
  // /^\/bar(?:\/(?=$))?$/i
  const m = path.match(regex)

  if (!m) {//没有匹配上
    return false
  } else {
    return true
  }
}
