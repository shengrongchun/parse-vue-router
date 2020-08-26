


export function normalizeLocation(
  raw,
  current,
  append,
  router
) {


  return {
    _normalized: true, //标准化后的标识
    path: null, // 路径
    query: null, // 查询参数
    hash: null // hash值
  }
}
