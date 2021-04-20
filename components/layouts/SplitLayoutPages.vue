
<script>
import SplitLayoutPage from "./SplitLayoutPage";

export default {
  props: {
    pages: { type: Object, default: () => ({}) },
  },

  components: { SplitLayoutPage },
  render(h) {
    const children = Object.entries(this.pages).map(([id, value]) => (
      <SplitLayoutPage
        page={value.page}
        node-id={id}
        key={id}
        unique={value.unique}
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