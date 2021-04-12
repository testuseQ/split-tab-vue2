<template>
  <div class="split-layout-page__page" :page="page" :node-id="nodeId">
    <keep-alive>
      <component :is="componentPage"> </component>
    </keep-alive>
  </div>
</template>

<script>
export default {
  props: {
    nodeId: String,
    page: String,
  },
  data() {
    return {
      componentPage: () => import(`~/pages/${this.page}`),
    };
  },
};
</script>
<style>
.split-layout-page__page {
  height: 100%;
  width: 100%;
}
</style>
