
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
    data.routerView = true //标识是一个router-view

    const h = parent.$createElement
    const name = props.name
    const route = parent.$route

    const matched = route.matched
    const component = matched && matched.components[name]
    console.log('RouteView组件', route);
    if (!matched || !component) {
      return h()
    }
    //
    return h(component, data, children)
  }
}
