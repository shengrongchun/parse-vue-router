
export function resolvePath(
  relative,
  base,
  append, // 是否直接追加到base后面
) {
  const firstChar = relative.charAt(0)
  if (firstChar === '/') {
    return relative
  }

  if (firstChar === '?' || firstChar === '#') {
    return base + relative
  }
  //说明这个 relative 是一个相对路径
  const stack = base.split('/')

  // remove trailing segment if:
  // - not appending
  // - appending to trailing slash (last segment is empty)
  // path: abc/d/ --> ['abc','d','']
  // 清除最后的空字符串
  if (!append || !stack[stack.length - 1]) {
    stack.pop()
  }

  // resolve relative path
  const segments = relative.replace(/^\//, '').split('/') // /a/b/c --> [a,b,c]
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    if (segment === '..') { // ../ 这个意思大家应该明白吧
      stack.pop()
    } else if (segment !== '.') {
      stack.push(segment)
    }
  }

  // ensure leading slash 确保开始是 /
  //如果stack[0]是空字符，那么在join('/')会确保开始是 /   ['','a','b'] --> /a/b
  if (stack[0] !== '') {
    stack.unshift('')
  }
  return stack.join('/')
}

//从path中解析出单纯的 path hash query
export function parsePath(path) {
  let hash = ''
  let query = ''
  // path: /a?b=1#c=2
  const hashIndex = path.indexOf('#')
  if (hashIndex >= 0) {
    hash = path.slice(hashIndex) // #c=2
    path = path.slice(0, hashIndex) // /a?b=1
  }

  const queryIndex = path.indexOf('?')
  if (queryIndex >= 0) {
    query = path.slice(queryIndex + 1) // b=1
    path = path.slice(0, queryIndex) // /a
  }

  return {
    path,
    query,
    hash
  }
}

//把path中 '//' --> '/'
export function cleanPath(path) {
  return path.replace(/\/\//g, '/')
}
