
export default {
  name: 'RouterView',
  functional: true,
  props: {
    name: {
      type: String,
      default: 'default'
    }
  },
  render (_, { props, children, parent, data }) {
    console.log('obj',obj);
    console.log('h',h);

    return h('h1', data, children)
  }
}
