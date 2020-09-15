<template>
  <div>
    <h1>vue-router</h1>
    <p style="cursor: pointer">
      <!-- 使用 router-link 组件来导航. -->
      <!-- 通过传入 `to` 属性指定链接. -->
      <!-- <router-link> 默认会被渲染成一个 `<a>` 标签 -->
      <router-link to="/">Go to Home</router-link>
      <br />
      <router-link to="/foo">Go to Foo</router-link>
      <br />
      <router-link to="/bar">Go to Bar</router-link>
    </p>
    <!-- 路由匹配到的组件将渲染在这里 -->
    <div style="background: #eee">
      <router-view></router-view>
    </div>
  </div>
</template>