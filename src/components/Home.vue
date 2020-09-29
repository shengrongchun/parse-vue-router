<template>
  <div class="scroll">Home……</div>
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
    console.log('home beforeRouterEnter')
    next()
  },
  created() {
    console.log('$route', this.$route)
  }
}
</script>