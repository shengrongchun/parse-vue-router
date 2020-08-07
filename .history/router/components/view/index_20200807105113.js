
export default {
  name: 'RouterView',
  functional: true,
  props: {
    name: {
      type: String,
      default: 'default'
    },
  },
  render (_, { props, children, parent, data }) {
    //
    console.log('props', this.props)
    const h = parent.$createElement
    return h('h1', data, children)
  }
}
