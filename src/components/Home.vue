<template>
  <div>Home……
    <div style="background: green">
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