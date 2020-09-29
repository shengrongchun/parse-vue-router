<template>
  <div>Foo……</div>
</template>
<script>
export default {
  props: {
    name: {
      type: String,
      default: null
    }
  },
  beforeRouteEnter(to, from, next) {
    console.log('foo beforeRouterEnter')
    next()
  },
  created() {
    console.log('$route', this.$route)
  }
}
</script>