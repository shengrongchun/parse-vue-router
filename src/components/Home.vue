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
  created() {
    console.log('$route', this.$route)
  }
}
</script>