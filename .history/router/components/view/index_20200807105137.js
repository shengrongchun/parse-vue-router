
export default {
  name: 'RouterView',
  functional: true,
  props: {
    name: {
      type: String,
      default: 'default'
    },
  },
  render (_, { children, parent, data }) {
    //
s    const h = parent.$createElement
    return h('h1', data, children)
  }
}
