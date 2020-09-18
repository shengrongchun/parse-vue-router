<template>
  <div>Bar……props传来了: ( {{name}} )</div>
</template>
<script>
export default {
  props: {
    name: {
      type: String,
      default: null
    }
  },
  created() {
    console.log('$route', this.$route)
  }
}
</script>