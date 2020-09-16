import { warn } from './warn'
const encodeReserveRE = /[!'()*]/g
const encodeReserveReplacer = c => '%' + c.charCodeAt(0).toString(16)
const commaRE = /%2C/g

// fixed encodeURIComponent which is more conformant to RFC3986:
// - escapes [!'()*]
// - preserve commas
const encode = str =>
  encodeURIComponent(str)
    .replace(encodeReserveRE, encodeReserveReplacer)
    .replace(commaRE, ',')
const decode = decodeURIComponent
// obj: {
//   a:1,
//   b:2,
//   c: [3,4]
// }
// 把参数字符串化 ?a=1&b=2&c=3&c=4
export function stringifyQuery(obj) {
  const res = obj
    ? Object.keys(obj)
      .map(key => {
        const val = obj[key]

        if (val === undefined) {
          return ''
        }

        if (val === null) {
          return encode(key)
        }

        if (Array.isArray(val)) {
          const result = []
          val.forEach(val2 => {
            if (val2 === undefined) {
              return
            }
            if (val2 === null) {
              result.push(encode(key))
            } else {
              result.push(encode(key) + '=' + encode(val2))
            }
          })
          return result.join('&')
        }

        return encode(key) + '=' + encode(val)
      })
      .filter(x => x.length > 0)
      .join('&')
    : null
  return res ? `?${res}` : ''
}
// query: ?a=1&b=2&c=3&c=4
// --> {
//   a:1,
//   b:2,
//   c: [3,4]
// }
function parseQuery(query) {
  const res = {}
  query = query.trim().replace(/^(\?|#|&)/, '') // ？# & --> ''
  if (!query) {
    return res
  }
  query.split('&').forEach(param => { //[a=1,b=2,……]
    const parts = param.replace(/\+/g, ' ').split('=') // + --> ' '
    const key = decode(parts.shift()) // parts: [a,1] shift删除第一个元素并且返回第一个元素
    const val = parts.length > 0 ? decode(parts.join('=')) : null

    if (res[key] === undefined) {
      res[key] = val
    } else if (Array.isArray(res[key])) {
      res[key].push(val)
    } else {
      res[key] = [res[key], val]
    }
  })

  return res
}
// query字符串 --> {key:value}形式
const castQueryParamValue = value => (value == null || typeof value === 'object' ? value : String(value))
export function resolveQuery(
  query, // ?a=1
  extraQuery, // {b:2}
  _parseQuery
) {
  const parse = _parseQuery || parseQuery
  let parsedQuery
  try {
    parsedQuery = parse(query || '')
  } catch (e) {
    process.env.NODE_ENV !== 'production' && warn(false, e.message)
    parsedQuery = {}
  }
  for (const key in extraQuery) {
    const value = extraQuery[key]
    parsedQuery[key] = Array.isArray(value)
      ? value.map(castQueryParamValue)
      : castQueryParamValue(value)
  }
  return parsedQuery
}