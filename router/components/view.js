import { warn } from '../util/warn'
import { extend } from '../util/misc'

export default {
  name: 'RouterView',
  functional: true, // vue的函数式组件
  props: {
    name: {
      type: String,
      default: 'default'
    },
  },
  render(_, { props, children, parent, data }) {
    // used by devtools to display a router-view badge
    data.routerView = true //标示自己是一个router-view
    //
    const h = parent.$createElement
    const name = props.name
    const route = parent.$route //组件依赖了$route
    // determine current view depth, also check to see if the tree
    // has been toggled inactive but kept-alive.
    let depth = 0 //自己是第几层的 router-view
    while (parent && parent._routerRoot !== parent) {//有parent并且parent不是根实例
      const vnodeData = parent.$vnode ? parent.$vnode.data : {}
      if (vnodeData.routerView) {//router-view组件标识
        depth++//一直向上级父层查找,找到 depth加一
      }
      parent = parent.$parent
    }
    data.routerViewDepth = depth
    //
    const matched = route.matched[depth] //record
    const component = matched && matched.components[name]
    if (!matched || !component) {
      return h()
    }
    // 从record中获取此组件name的props
    const configProps = matched.props && matched.props[name]
    // save route and configProps in cache
    if (configProps) {//把props信息注入到组件的props中
      fillPropsinData(component, data, route, configProps)
    }
    return h(component, data, children)
  }
}

function fillPropsinData(component, data, route, configProps) {
  // data.props在组件render过程中，会给相同key的component.props赋值
  // 如：data.props = {name:111},组件的props如果定义了name,name的值会赋值为111
  let propsToPass = data.props = resolveProps(route, configProps)
  console.log('propsToPass', propsToPass)
  if (propsToPass) {
    // clone to prevent mutation
    propsToPass = data.props = extend({}, propsToPass)
    // props传的值没有在组件中的props里定义，就降级存储在attrs中
    const attrs = data.attrs = data.attrs || {}
    for (const key in propsToPass) {
      if (!component.props || !(key in component.props)) {
        attrs[key] = propsToPass[key]
        delete propsToPass[key]
      }
    }
  }
}

function resolveProps(route, config) {//三种类型的判断（布尔，对象，函数）
  switch (typeof config) {
    case 'undefined':
      return
    case 'object':
      return config
    case 'function':
      return config(route) // 函数的参数传的是当前的route
    case 'boolean':
      return config ? route.params : undefined  // 比如 params: {a:1,b:2} --> 在组件的props: {a:1,b:2}
    default:
      if (process.env.NODE_ENV !== 'production') {
        warn(
          false,
          `props in "${route.path}" is a ${typeof config}, ` +
          `expecting an object, function or boolean.`
        )
      }
  }
}