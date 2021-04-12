<template>
  <div class="sidebar">
    <!-- use router-link component for navigation. -->
    <!-- specify the link by passing the `to` prop. -->
    <!-- `<router-link>` will be rendered as an `<a>` tag by default -->
    <router-link to="/">Go to /</router-link>
    <router-link to="/layout">Go to layout</router-link>
    <router-link to="/demo-layout">Go to demo layout</router-link>
    <router-link to="/TestPageA">Go to a</router-link>
    <router-link to="/TestPageB">Go to b</router-link>
    <router-link to="/TestPageC">Go to c</router-link>
  </div>
</template>
<style scoped>
.sidebar {
  height: 100%;
  width: 20%;
  display: flex;

  flex-direction: column;
}
</style>