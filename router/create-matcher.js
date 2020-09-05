import { warn } from './util/warn'
import { createRoute } from './util/route'
import { normalizeLocation } from './util/location'
import { fillParams } from './util/params'
import Regexp from 'path-to-regexp'
//
import Home from '../src/components/Home'
import Foo from '../src/components/Foo'
import Bar from '../src/components/Bar'
// routes: [
//   { path: '/', name: 'home', component: Home },
//   { path: '/foo', name: 'foo', component: Foo },
//   { path: '/bar:id', name: 'bar', component: Bar }
// ]
const pathList = ["", "/foo", "/bar/:id"]
const pathMap = {
  '': {//record
    beforeEnter: undefined,//路由独享的守卫
    components: { default: Home },
    instances: {},
    matchAs: undefined,
    meta: {}, //路由元数据
    name: 'home',
    parent: undefined,
    path: '',
    props: {},// 通过 props 解耦  vue中的props: {}
    redirect: undefined,
    regex: Regexp('', [], {})
    //regex: /^(?:\/(?=$))?$/i
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
    regex: Regexp('/foo', [], {}),
    //regex: /^\/foo(?:\/(?=$))?$/i
  },
  '/bar/:id': {
    beforeEnter: undefined,
    components: { default: Bar },
    instances: {},
    matchAs: undefined,
    meta: {},
    name: 'bar',
    parent: undefined,
    path: '/bar/:id',
    props: {},
    redirect: undefined,
    regex: Regexp('/bar/:id', [], {}),
    //regex: /^\/bar(?:\/(?=$))?$/i
  },
}
const nameMap = { home: pathMap[''], foo: pathMap['/foo'], bar: pathMap['/bar/:id'] }
//通过当前location创建当前路由
export function createMatcher(
  routes,
  router,
) {

  //raw的可能性
  // 1：字符串如：/pathname?search=123#hash=111
  // 2：对象如： {path: '/……', query: {}} 3: {name: xxx, params: {}, query: {}}
  function match(
    raw,
    currentRoute,
    redirectedFrom
  ) {
    const location = normalizeLocation(raw, currentRoute, false, router) // false--> append
    const { name } = location
    if (name) {
      const record = nameMap[name]
      if (process.env.NODE_ENV !== 'production') {
        warn(record, `Route with name '${name}' does not exist`)
      }
      if (!record) return _createRoute(null, location)
      //通过正则来收集path应当的参数 如： /a:username/:userid   paramNames: [username, userid]
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
      location.params = {} // 这句代码，让在有path的时候无视了params
      // 这里循环的原因是可能会匹配多个路由，所以会选择最先匹配上的路由
      for (let i = 0; i < pathList.length; i++) {
        const path = pathList[i]
        const record = pathMap[path]

        if (matchRoute(record.regex, location.path, location.params)) {
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

// path: /man/123/456   regex是通过 /man/:id/:user创建的正则解析对象
// regex.keys: [
//   {
//     asterisk: false
//     delimiter: "/"
//     name: "id"
//     optional: false
//     partial: false
//     pattern: "[^\/]+?"
//     prefix: "/"
//     repeat: false
//   },
//   {
//     asterisk: false
//     delimiter: "/"
//     name: "user"
//     optional: false
//     partial: false
//     pattern: "[^\/]+?"
//     prefix: "/"
//     repeat: false
//   },
// ]
// path.match(regex)：["/man/123/456", "123", "456", index: 0, input: "/man/123/456", ……]
function matchRoute(
  regex,
  path,
  params
) {
  //
  const m = path.match(regex)

  if (!m) {//没有匹配上
    return false
  } else if (!params) { //?
    return true
  }

  for (let i = 1, len = m.length; i < len; ++i) {
    const key = regex.keys[i - 1]
    const val = typeof m[i] === 'string' ? decodeURIComponent(m[i]) : m[i]
    if (key) {
      // Fix #1994: using * with props: true generates a param named 0
      // key.name:0 的情况，path: /man-* , push({path: '/man-pathM'}) --> params.pathMatch = pathM
      params[key.name || 'pathMatch'] = val
    }
  }

  return true
}
