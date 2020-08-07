
// work around weird flow bug
const toTypes = [String, Object]
const eventTypes = [String, Array]


export default {
  name: 'RouterLink',
  props: {
    to: {
      type: toTypes,
      required: true
    },
    tag: {
      type: String,
      default: 'a'
    },
    event: {
      type: eventTypes,
      default: 'click'
    }
  },
  render (h) {
    const data =  {
      attrs: {href: this.to} 
    }
    return h(this.tag, data, this.$slots.default)
  }
}
