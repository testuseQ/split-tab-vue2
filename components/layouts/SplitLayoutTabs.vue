<script>
import simplebar from "simplebar-vue";

import "simplebar/dist/simplebar.min.css";
export default {
  props: {
    node: { type: [String, Number, Object], default: () => ({}) },
    closeable: { type: Boolean, default: true },
  },

  components: {
    simplebar,
  },
  methods: {
    tabClose(event) {
      this.$emit("tabClose", event);
    },

    tabDragStart(event) {
      this.$emit("tabDragStart", event);
    },
  },
  render(h) {
    const activeIndex = this.node.children.findIndex(
      (child) => child.active === true
    );

    const headers = [];

    for (let i = 0; i < this.$slots.default.length; i++) {
      const child = this.node.children[i];
      const tabHeaders = [];

      tabHeaders.push(
        <div class="split-layout-tabs__header-title">{[child.title]}</div>
      );
      if (this.closeable) {
        tabHeaders.push(
          <div
            class="split-layout-tabs__header-close"
            on={{ mousedown: this.tabClose, touchstart: this.tabClose }}
          >
            <div class="split-layout-tabs__close-icon" />
          </div>
        );
      }

      headers.push(
        <div
          class={"split-layout-tabs__header" + (child.active ? " active" : "")}
          on={{
            mousedown: this.tabDragStart,
            touchstart: this.tabDragStart,
          }}
          attrs={{ "node-id": "_" + child.id }}
        >
          {tabHeaders}
        </div>
      );
    }

    headers.push(<div class="split-layout-tabs__header-space"></div>);
    let header = (
      <simplebar
        class={"split-layout-tabs__headers-bar"}
        data-simplebar-auto-hide="true"
      >
        <div
          class={
            "split-layout-tabs__headers" + (this.node.active ? " active" : "")
          }
        >
          {headers}
        </div>
      </simplebar>
    );

    let content = (
      <div class={"split-layout-tabs__content"}>
        {[this.$slots.default[activeIndex]]}
      </div>
    );

    if (
      this.node.children[activeIndex].scrollX === true ||
      this.node.children[activeIndex].scrollY === true
    ) {
      content = (
        <simplebar
          class={
            "split-layout-tabs__content-bar " +
            (this.node.children[activeIndex].scrollX
              ? ""
              : " split-layout-tabs__content-bar--hidden-x") +
            (this.node.children[activeIndex].scrollY
              ? ""
              : " split-layout-tabs__content-bar--hidden-y")
          }
          data-simplebar-auto-hide="true"
        >
          {content}
        </simplebar>
      );
    } else {
      content = (
        <div class={"split-layout-tabs__content-bar-dummy"}>{content}</div>
      );
    }

    return (
      <div class="split-layout-tabs__tabs" node-id={"_" + this.node.id}>
        {[header, content]}
      </div>
    );
  },
};
</script>
<style>
.split-layout-tabs__tabs {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  color: #888888;
}
.split-layout-tabs__headers-bar {
  height: 2em;
}
.split-layout-tabs__content-bar {
  height: calc(100% - 2em);
}
.split-layout-tabs__content-bar-dummy {
  height: calc(100% - 2em);
}
.split-layout-tabs__content {
  height: 100%;
}
.split-layout-tabs__content-bar--hidden-x
  > .simplebar-track.simplebar-horizontal {
  visibility: hidden !important;
}
.split-layout-tabs__content-bar--hidden-y
  > .simplebar-track.simplebar-vertical {
  visibility: hidden !important;
}

/* .split-layout-tabs__content-bar--hidden-x
  > .simplebar-wrapper
  > .simplebar-mask
  > .simplebar-offset
  > .simplebar-content-wrapper
  > .simplebar-content {
  overflow-x: hidden;
}
.split-layout-tabs__content-bar--hidden-y
  > .simplebar-wrapper
  > .simplebar-mask
  > .simplebar-offset
  > .simplebar-content-wrapper
  > .simplebar-content {
  overflow-y: hidden;
} */
.split-layout-tabs__headers {
  display: flex;
  flex-direction: row;
  height: 2em;
}

.split-layout-tabs__header {
  display: flex;
  flex-direction: row;
  background-color: rgb(224, 224, 224);
  border: solid rgb(200, 200, 200);
  border-width: 0px 1px 0px 0px;
  border-bottom-color: transparent;
  cursor: default;
  user-select: none;
  padding: 0.75em 1em 0.75em 1em;
  font-size: 0.75em;

  /* position: relative; */
  /* transform-style: flat; */
  /* transition: all 250ms ease-out; */
}
.split-layout-tabs__header:hover {
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3),
    0 0 40px rgba(128, 128, 128, 0.1) inset;
  z-index: 20;
  cursor: pointer;
}
.split-layout-tabs__header.active {
  background-color: rgb(255, 255, 255);
}
.split-layout-tabs__header-space {
  height: 100%;
  flex-grow: 1;

  display: flex;
  flex-direction: row-reverse;
  background-color: rgb(231, 234, 237);
}
.split-layout-tabs__headers.active > .split-layout-tabs__header.active {
  color: black;
}
.split-layout-tabs__header:last-child {
  border-width: 0px 1px 0px 0px;
}

.split-layout-tabs__header-title {
  margin-right: 0.5em;
  white-space: nowrap;
  pointer-events: none;
}
.split-layout-tabs__header-close {
  display: flex;
  margin-left: auto;
  align-items: center;
}

.split-layout-tabs__close-icon {
  font-size: 100px;
  position: relative;
  line-height: 1;
  width: 0.16em;
  height: 0.16em;
  border: 0;
  background-color: transparent;
  border-radius: 100%;
  transition: background-color 0.1s;
}
.split-layout-tabs__close-icon:hover {
  background-color: #d8d9da;
  transition: background-color 0.2s;
}
.split-layout-tabs__close-icon::after,
.split-layout-tabs__close-icon::before {
  content: "";
  position: absolute;
  display: inline-block;

  top: 50%;
  left: 50%;
  width: 80%;
  height: 0.015em;
  margin: -4% 0 0 -40%;
  border: 0;
  padding: 0;
  border-radius: 0.015em;
  background-color: currentcolor;
}
.split-layout-tabs__close-icon::before {
  transform: rotate(-45deg);
}
.split-layout-tabs__close-icon::after {
  transform: rotate(45deg);
}
</style>