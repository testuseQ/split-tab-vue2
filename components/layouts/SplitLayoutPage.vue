<template>
  <div class="split-layout-page__page" :page="page" :node-id="'_' + nodeId">
    <keep-alive>
      <component :is="componentPage" :rect="rect"> </component>
    </keep-alive>
  </div>
</template>

<script>
export default {
  props: {
    nodeId: String,
    page: String,
  },
  // computed:{
  //   _nodeId(){
  //     return '_' + nodeId

  //   }
  // },
  beforeDestroy() {
    if (this.$eventHub) {
      console.log("rthis.$eventHub.$off");
      this.$eventHub.$off("set-rect-" + this.nodeId, this.setRect);
    }
  },
  mounted() {
    if (this.$eventHub) {
      console.log("this.$eventHub.$on");
      this.$eventHub.$on("set-rect-" + this.nodeId, this.setRect);
    }
    this.$nextTick(() => {
      this.setRect();
    });
  },

  methods: {
    setRect(nextTick) {
      // console.log(
      //   "pre setRect-" + this.nodeId,
      //   this.$el.clientWidth,
      //   this.$el.clientHeight
      // );
      if (nextTick) {
        this.$nextTick(() => {
          // console.log(
          //   "nextTick setRect-" + this.nodeId,
          //   this.$el.clientWidth,
          //   this.$el.clientHeight
          // );
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
        // next nextTick
        this.$nextTick(() => {
          this.$nextTick(() => {
            // console.log(
            //   "next nextTick setRect-" + this.nodeId,
            //   this.$el.clientWidth,
            //   this.$el.clientHeight
            // );
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
