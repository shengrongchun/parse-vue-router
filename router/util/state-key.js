import { inBrowser } from './dom'

// use User Timing api (if present) for more accurate key precision
const Time =
  inBrowser && window.performance && window.performance.now
    ? window.performance
    : Date

export function genStateKey() {
  return Time.now().toFixed(3)
}

let _key = genStateKey()

export function getStateKey() {//获取唯一key
  return _key
}

export function setStateKey(key) {//设置唯一key
  return (_key = key)
}
