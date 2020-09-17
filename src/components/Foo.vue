<template>
  <div>Foo……
    <div style="background: yellow">
      <router-view />
    </div>
  </div>
</template>
<script>
export default {
  created() {
    console.log('$route', this.$route)
  }
}
</script>