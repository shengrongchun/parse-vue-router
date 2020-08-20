
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

    //
    const h = parent.$createElement
    const name = props.name
    const route = parent.$route
    console.log('RouteView组件', route);
    const matched = route.matched[0]
    const component = matched && matched.components[name]
    if (!matched || !component) {
      return h()
    }
    return h(component, data, children)
  }
}
