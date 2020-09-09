<template>
  <h1>Bar</h1>
</template>
<script>
export default {
  props: {
    propsName: {
      type: String,
      required: true
    }
  },
  created() {
    console.log('this', this.propsName)
  }
}
</script>