<template>
  <div>Foo……props传来了: ( {{name}} )
    <div style="background: yellow">
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