<template>
  <div
    class="split-layout-page__page"
    :page="page"
    :node-id="'_' + nodeId"
    :unique="unique"
    @mousedown.capture="onCapturePage"
  >
    <keep-alive>
      <component :is="componentPage" :rect="rect"> </component>
    </keep-alive>
  </div>
</template>

<script>
export default {
  props: {
    nodeId: Number,
    page: String,
    unique: String,
  },
  // computed:{
  //   _nodeId(){
  //     return '_' + nodeId

  //   }
  // },
  beforeDestroy() {
    if (this.$eventHub) {
      this.$eventHub.$off("set-rect-" + this.nodeId, this.setRect);
    }
  },
  mounted() {
    if (this.$eventHub) {
      this.$eventHub.$on("set-rect-" + this.nodeId, this.setRect);
    }
    this.$nextTick(() => {
      this.setRect();
    });
  },

  methods: {
    onCapturePage() {
      this.$emit("capturePage", this.nodeId);
    },
    setRect(nextTick) {
      if (nextTick) {
        this.$nextTick(() => {
          const width = this.$el.clientWidth;
          const height = this.$el.clientHeight;
          if (width !== this.width || height !== this.rect.height) {
            this.rect = {
              width,
              height,
            };
          }
        });
      } else {
        this.$nextTick(() => {
          this.$nextTick(() => {
            const width = this.$el.clientWidth;
            const height = this.$el.clientHeight;
            if (width !== this.width || height !== this.rect.height) {
              this.rect = {
                width,
                height,
              };
            }
          });
        });
      }
    },
  },

  data() {
    return {
      componentPage: () => import(`~/pages/${this.page}`),
      rect: { width: 0, height: 0 },
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
