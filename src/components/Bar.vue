<template>
  <div class="bar">
    bar
    <div style="height:1500px"></div>
    <p id="anchor"
       style="height:500px">Anchor</p>
    <p id="anchor2"
       style="height:500px">Anchor2</p>
    <p id="1number">with number</p>
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