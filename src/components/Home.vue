<template>
  <div>Home……。props传来了: ( {{name}} )
    <div style="background: green">
      <router-view />
    </div>
  </div>
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