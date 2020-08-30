
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

