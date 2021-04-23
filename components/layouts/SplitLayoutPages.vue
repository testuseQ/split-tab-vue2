
<script>
import SplitLayoutPage from "./SplitLayoutPage";

export default {
  props: {
    pages: { type: Object, default: () => ({}) },
  },

  components: { SplitLayoutPage },
  methods: {
    onCapturePage(nodeId) {
      this.$emit("capturePage", nodeId);
    },
  },
  render(h) {
    const children = Object.entries(this.pages).map(([id, value]) => (
      <SplitLayoutPage
        page={value.page}
        node-id={Number(id)}
        key={id}
        unique={value.unique}
        onCapturePage={this.onCapturePage}
      />
    ));
    return <div class="split-layout-pages__contener">{children}</div>;
  },
};
</script>
<style>
.split-layout-pages__contener {
  height: 100%;
  width: 100%;
}
</style>