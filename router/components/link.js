
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
  render(h) {
    // const router = this.$router
    // const current = this.$route
    // const { location } = router.resolve(
    //   this.to,
    //   current,
    //   this.append
    // )

    const data = {
      on: {
        click: () => {
          //router.push(location)
        }
      }
    }
    return h(this.tag, data, this.$slots.default)
  }
}
