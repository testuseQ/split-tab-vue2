
<script>
import SplitLayoutPage from "./SplitLayoutPage";

export default {
  props: {
    pages: { type: Object, default: () => ({}) },
  },

  components: { SplitLayoutPage },
  render(h) {
    const children = Object.entries(this.pages).map(([id, page]) => (
      <SplitLayoutPage page={page} node-id={id} key={id} />
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