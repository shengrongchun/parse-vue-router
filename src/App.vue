<template>
  <div>
    <h1>vue-router</h1>
    <p style="cursor: pointer">
      <!-- 使用 router-link 组件来导航. -->
      <!-- 通过传入 `to` 属性指定链接. -->
      <!-- <router-link> 默认会被渲染成一个 `<a>` 标签 -->
      <router-link :to="{name: 'Home'}">Go to Home</router-link>
      <br />
      <router-link :to="{path: '/foo'}">Go to Foo</router-link>
      <br />
      <router-link :to="{path: '/bar'}">Go to Bar</router-link>
      <br />
      <!-- <ul>
      <li>
        <router-link to="/bar#anchor">/bar#anchor</router-link>
      </li>
      <li>
        <router-link to="/bar#anchor2">/bar#anchor2</router-link>
      </li>
      <li>
        <router-link to="/bar#1number">/bar#1number</router-link>
      </li>
    </ul> -->
    </p>
    <!-- 路由匹配到的组件将渲染在这里 -->
    <div style="background: #eee">
      <transition name="fade"
                  mode="out-in"
                  @after-leave="afterLeave">
        <router-view class="view"></router-view>
      </transition>
    </div>
  </div>
</template>
<script>
export default {
  methods: {
    afterLeave() {
      this.$root.$emit('triggerScroll')
    }
  }
}
</script>
<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter,
.fade-leave-active {
  opacity: 0;
}
/* .view {
  border: 1px solid red;
  height: 4500px;
  position: relative;
} */
</style>