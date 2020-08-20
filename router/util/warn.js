
export function assert(condition, message) {
  if (!condition) {
    throw new Error(`[vue-router] ${message}`)
  }
}

export function warn(condition, message) {
  if (process.env.NODE_ENV !== 'production' && !condition) {
    typeof console !== 'undefined' && console.warn(`[vue-router] ${message}`)
  }
}

export function isError(err) {
  return Object.prototype.toString.call(err).indexOf('Error') > -1
}

export function isRouterError(err, errorType) {
  return isError(err) && err._isRouter && (errorType == null || err.type === errorType)
}
