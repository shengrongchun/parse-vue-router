
export default {
  name: 'RouterView',
  functional: true,
  props: {
    name: {
      type: String,
      default: 'default'
    }
  },
  render (h, obj) {
    console.log('obj',obj);
    console.log('h',h);

    return h('h1', {}, this.$slots.default)
  }
}
