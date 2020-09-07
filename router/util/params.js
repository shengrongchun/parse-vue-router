import { warn } from './warn'
import Regexp from 'path-to-regexp'

// $flow-disable-line
const regexpCompileCache = Object.create(null)
// ## pathMatch 通配符匹配的字符串
export function fillParams(
  path,
  params,
  routeMsg
) {
  params = params || {}
  try {
    // 例子：path: /user/:id/:name
    // Regexp.compile(path)( {id:111,name: hello} ) --> /user/111/hello
    const filler =
      regexpCompileCache[path] ||
      (regexpCompileCache[path] = Regexp.compile(path))

    // Fix #2505 resolving asterisk routes { name: 'not-found', params: { pathMatch: '/not-found' }}
    // and fix #3106 so that you can work with location descriptor object having params.pathMatch equal to empty string
    if (typeof params.pathMatch === 'string') params[0] = params.pathMatch

    return filler(params, { pretty: true })
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      // Fix #3072 no warn if `pathMatch` is string
      warn(typeof params.pathMatch === 'string', `missing param for ${routeMsg}: ${e.message}`)
    }
    return ''
  } finally {
    // delete the 0 if it was added
    delete params[0]
  }
}
