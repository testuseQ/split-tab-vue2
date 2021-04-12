
<script>
import SplitLayoutPages from "./SplitLayoutPages";
import SplitLayoutTabs from "./SplitLayoutTabs";
import SplitLayoutContainer from "./SplitLayoutContainer";
import SplitLayoutTree from "./SplitLayoutTree.js";
export default {
  props: {
    tabOmitted: { type: String, default: "" }, // none/alone/all
    tabDisabled: { type: Boolean, default: false },
    closeable: { type: Boolean, default: true },
    addable: { type: Boolean, default: true },
    edit: { type: Boolean, default: true },
    resize: { type: Boolean, default: true },
    layouts: { type: [String, Number, Object], default: () => ({}) },
    insertAmount: { type: [String, Number], default: 33 },
    insertPreview: { type: [String, Number], default: 33 },
    saveState: { type: [String], default: "query" },
    onSaveState: {
      type: [Function],
      default: () => {},
    },
    onLoadState: { type: [Function], default: () => "" },
    outerInsertable: { type: Boolean, default: true },
    outerInsertAmount: { type: [String, Number], default: 33 },
    outerInsertPreview: { type: [String, Number], default: 0 },
  },
  components: { SplitLayoutPages, SplitLayoutTabs, SplitLayoutContainer },

  mixins: [SplitLayoutTree],
  data() {
    return {
      root: this.initLayouts(),
      drag: {
        on: false,
        node: undefined,
        offset: undefined,
        nextActive: undefined,
        dom: undefined,
      },
      stringify: "",
    };
  },

  watch: {
    layouts() {
      console.log("watch splits");
      this.root = this.calcLayouts();
    },

    // root: {
    //   handler: function (val, oldVal) {
    //     console.log("watch root");
    //   },
    //   deep: true,
    // },
  },

  beforeDestroy() {
    if (this.$eventHub) {
      this.$eventHub.$off("add-view");
    }
  },

  created() {
    if (this.$eventHub) {
      this.$eventHub.$on("add-view", this.addView);
    }
  },
  methods: {
    addView(args) {
      let { page, key, title, tabs, scroll, scrollX, scrollY } = args;
      key = key ?? page;
      title = title ?? page;
      tabs = tabs ?? true;
      scrollX = scroll ?? scrollX ?? true;
      scrollY = scroll ?? scrollY ?? true;

      console.log("router addView");
      let target = this.findNode(this.root, (x) => x.key === key);

      if (target != null) {
        if (this.tabDisabled) return;
        this.setTabActive(this.root, target);
      } else {
        if (!this.edit) return;
        let newNode = {
          type: "page",
          id: this.getSequenceId(this.root),
          page,
          key,
          title,
          active: false,
          tabs,
          scrollX,
          scrollY,
        };
        let parent = this.findNode(
          this.root,
          (x) => x.type === "tabs" && x.active
        );

        if (parent) {
          let insertIndex = parent.children.findIndex((x) => x.active);

          this.attachTabChild(
            this.root,
            parent,
            newNode,
            "center",
            null,
            insertIndex
          );

          console.log("Layout parent", parent);
        } else {
          this.attachTabChild(this.root, this.root, newNode, "center", null);

          console.log("Layout view root", newNode);
        }
      }

      //this.save();
    },
    onTabDragStart(e) {
      if (e.button !== 0) return;

      console.log("onTabDragStart");
      let node = this.getNode(this.root, e);

      if (node === undefined) {
        console.log(" node is undefined");
        return;
      }
      e.preventDefault();
      e.stopPropagation();

      // if (this.tabDisabled) {
      //   return;
      // }
      this.setTabActive(this.root, node);

      // this.save();
      // if (!this.edit) {
      //   return;
      // }

      let nextActive = this.getNextActive(this.root, node);
      const containerRect = this.$refs.container.getBoundingClientRect();
      const trect = e.target.getBoundingClientRect(); // Target is draggable

      this.drag = {
        node: node,
        offset: { x: e.clientX - trect.left, y: e.clientY - trect.top },
        on: false,
        nextActive: nextActive,
        dom: e.target.cloneNode(true),
      };

      this.$refs.drag.style.top = trect.y - containerRect.top + "px";
      this.$refs.drag.style.left = trect.x - containerRect.left + "px";
      this.$refs.drag.style.width = trect.width + "px";
      this.$refs.drag.style.height = trect.height + "px";

      document.addEventListener("mousemove", this.onTabDrag);
      document.addEventListener("mouseup", this.onTabDrop);
    },
    onTabDrag(e) {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      if (!this.drag.on) {
        this.drag.on = true;
        console.log("this.drag.on", this.drag);
        this.stringify = this.serializeTree(this.root);
        this.removeNode(this.root, this.drag.node);

        if (this.drag.nextActive != null) {
          this.drag.nextActive.active = true;
        }
      }

      this.drag.over = null; // reset over
      //console.log("onTabDrag");

      const containerRect = this.$refs.container.getBoundingClientRect();
      const rel = {
        x: e.clientX - containerRect.left,
        y: e.clientY - containerRect.top,
      };
      // move drag as expected
      this.$refs.drag.style.left = rel.x - this.drag.offset.x + "px";
      this.$refs.drag.style.top = rel.y - this.drag.offset.y + "px";

      // Disable drag temporarly to get below element
      this.$refs.drag.style.pointerEvents = "none";
      const el = document.elementFromPoint(e.clientX, e.clientY);
      this.$refs.drag.style.pointerEvents = null;

      if (this.outerInsertable) {
        const attach = this.checkAttach(
          this.$refs.layout,
          e,
          this.outerInsertPreview
        );
        if (attach !== "center") {
          this.drag.over = {
            dom: this.$refs.layout,
            attach,
            amount: this.outerInsertAmount,
          };
          this.previewPane(
            this.$refs.preview,
            this.drag.over.attach,
            this.drag.over.dom,
            this.drag.over.amount
          );
          return;
        }
      }

      // find parent
      let dom = el;
      dom = this.getAncestorDom(
        dom,
        ".split-layout-tabs__header-space, .split-layout-tabs__header, .split-layout-tabs__content, .split-layout__layout",
        ".split-layout-container__minimize-vertical, .split-layout-container__minimize-horizontal, .split-layout-container__splitter"
      );

      if (dom == null) {
        this.previewPane(this.$refs.preview, "none");
        return;
      }

      let attach = undefined;

      if (dom.matches(".split-layout-tabs__header-space")) {
        attach = "center";
      } else if (dom.matches(".split-layout-tabs__header")) {
        attach = "center";
      } else if (
        dom.matches(".split-layout-tabs__content, .split-layout__layout")
      ) {
        attach = this.checkAttach(dom, e, this.insertPreview);
      }

      this.drag.over = { dom, attach, amount: this.insertAmount };
      this.previewPane(
        this.$refs.preview,
        this.drag.over.attach,
        this.drag.over.dom,
        this.drag.over.amount
      );
    },
    onTabDrop(e) {
      if (e.button !== 0) return;
      document.removeEventListener("mousemove", this.onTabDrag);
      document.removeEventListener("mouseup", this.onTabDrop);

      this.$refs.drag.style.top = 0;
      this.$refs.drag.style.right = 0;
      this.$refs.drag.style.bottom = 0;
      this.$refs.drag.style.left = 0;
      this.$refs.drag.style.width = 0;
      this.$refs.drag.style.height = 0;
      if (!this.drag.on) {
        return;
      }
      this.previewPane(this.$refs.preview, "none");
      if (this.drag.over == null) {
        this.drag = null;
        this.root = this.deserializeTree(this.stringify);
        console.log("onViewDrop rollback");
        return;
      }
      var { dom, attach, amount } = this.drag.over;

      let target = undefined;
      let insertIndex = undefined;

      if (dom.matches(".split-layout-tabs__header-space")) {
        dom = this.getAncestorDom(dom, ".split-layout-tabs__tabs");
        const nodeId = Number(dom.getAttribute("node-id"));
        target = this.findIdNode(this.root, nodeId);
      } else if (dom.matches(".split-layout-tabs__header")) {
        const nodeId = Number(dom.getAttribute("node-id"));
        const node = this.findIdNode(this.root, nodeId);
        target = this.getParentNode(this.root, node);
        insertIndex = target.children.findIndex((x) => x.id === node.id);
      } else if (dom.matches(".split-layout-tabs__content")) {
        dom = this.getAncestorDom(dom, ".split-layout-tabs__tabs");
        const nodeId = Number(dom.getAttribute("node-id"));
        target = this.findIdNode(this.root, nodeId);
      } else if (dom.matches(".split-layout__layout")) {
        target = this.root;
      }
      this.attachTabChild(
        this.root,
        target,
        this.drag.node,
        attach,
        amount,
        insertIndex
      );

      this.drag = null;
      console.log("onTabDrop");
      //this.save();
    },
    onTabClose(e) {
      if (e.button !== 0) return;
      console.log("layout onTabClose");

      let node = this.getNode(this.root, e);
      if (node === undefined) {
        console.log(" node is undefined");
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      let nextActive = this.getNextActive(this.root, node);
      this.removeNode(this.root, node);
      this.setTabActive(this.root, nextActive);

      //this.save();
    },

    evacuatePage(node) {
      const nodes = this.findNodes(node, (x) => x.type === "page");

      var targetEl = this.$refs.container.querySelector(
        ".split-layout-pages__contener"
      );

      const els = nodes.map((x) =>
        this.$refs.container.querySelector(
          `.split-layout-page__page[node-id="${x.id}"]`
        )
      );

      Array.from(els).forEach((e) => {
        targetEl.appendChild(e);
      });
    },

    restorePage(node) {
      this.$nextTick(() => {
        const nodes = this.findNodes(node, (x) => x.type === "page");

        nodes.forEach((x) => {
          const e = this.$refs.container.querySelector(
            `.split-layout__page[node-id="${x.id}"]`
          );
          const srcView = this.$refs.pages.querySelector(
            `.split-layout-page__page[node-id="${x.id}"] `
          );
          console.log(node, e, srcView);

          e.appendChild(srcView);
        });
      });
    },

    onSetMinimize(nodeId, type, percent) {
      console.log("onSetMinimize", nodeId, type, percent);
      const node = this.findIdNode(this.root, nodeId);
      const parent = this.getParentNode(this.root, node);
      const siblingIndex = parent.children.findIndex(
        (child) => child.id === node.id
      );
      //this.$set(parent.minimizes[siblingIndex], "percent", percent);
      //this.$set(parent.minimizes[siblingIndex], "type", type);

      parent.minimizes[siblingIndex].percent = percent;
      parent.minimizes[siblingIndex].type = type;
      //this.$forceUpdate();

      if (type === "none") {
        this.restorePage(node);
      } else {
        this.evacuatePage(node);
      }
    },
    onSetPercents(nodeId, percents) {
      //console.log("setPercents", nodeId, percents);
      const node = this.findIdNode(this.root, nodeId);
      node.percents = [...percents];
    },
    calcLayouts() {
      let idCounter = 1;
      const walkLayouts = (node, { parentType, active }) => {
        if (node == null || !node instanceof Object) return undefined;

        let type = "";
        if (
          (node.type === "container" || node.type == null) &&
          node.hasOwnProperty("children") &&
          !node.hasOwnProperty("page") &&
          (node.dir === "horizontal" || node.dir === "vertical")
        ) {
          type = "container";
        } else if (
          (node.type === "tabs" || node.type == null) &&
          node.hasOwnProperty("children") &&
          !node.hasOwnProperty("page") &&
          node.dir == null
        ) {
          type = "tabs";
        } else if (
          (node.type === "page" || node.type == null) &&
          !node.hasOwnProperty("children") &&
          node.hasOwnProperty("page") &&
          node.dir == null
        ) {
          type = "page";
        } else if (Object.keys(node).length === 0) {
          type = "empty";
        } else {
          type = "error";
        }

        switch (type) {
          case "container": {
            // Determine the percentage of the page width from the weights.
            const weights = node.children.map((child) => {
              return child.weight ?? 1;
            });
            const totalWeight = weights.reduce((p, x) => p + x);
            const percents = weights.map((weight) => weight / totalWeight);

            const minimizes = node.children.map(() => ({
              type: "none",
              percent: 0,
            }));

            const children = (node.children || []).map((child) =>
              walkLayouts(child, { parentType: type })
            );
            return {
              type,
              id: idCounter++,
              dir: node.dir,
              percents,
              minimizes,
              children,
            };
          }
          case "tabs": {
            // Decide which tabs to activate
            let defaultActive = node.children.every(
              (child) => child.active == null || child.active === false
            );

            const children = (node.children ?? []).map((child, index) =>
              walkLayouts(child, {
                parentType: type,
                active: (defaultActive && index === 0) || child.active,
              })
            );
            return { type, id: idCounter++, children, active: node.active };
          }
          case "page": {
            // Complete tab omissions
            if (parentType == "tabs" || node.tabs) {
              return {
                type,
                id: idCounter++,
                page: node.page,
                key: node.key ?? node.page,
                title: node.title ?? node.page,
                active,
                tabs: node.tabs ?? true,
                scrollX: node.scroll ?? node.scrollX ?? true,
                scrollY: node.scroll ?? node.scrollY ?? true,
              };
            } else {
              const children = [
                walkLayouts(node, { parentType: "tabs", active: true }),
              ];
              return { type: "tabs", id: idCounter++, children };
            }
          }
          case "empty": {
            return null;
          }
          case "error": {
            console.error("parse error layout");
            return null;
          }
        }
      };

      const child = walkLayouts(this.layouts, {});
      const children = [];
      if (child != null) {
        children.push(child);
      }
      const root = {
        type: "root",
        id: 0,
        ids: [...Array(idCounter).keys()],
        children,
      };
      const count = this.countNode(root, (x) => x.type === "tabs" && x.active);
      console.log("count", count);
      if (count > 1) {
        const activeNode = this.findNode(
          root,
          (x) => x.type === "tabs" && x.active
        );
        const count = this.walkNode(root, (x) => {
          if (x.type === "tabs" && x.active && activeNode.id !== x.id) {
            x.active = false;
          }
        });
        console.log("activeNode", activeNode);
      } else if (count === 0) {
        const activeNode = this.findNode(root, (x) => x.type === "tabs");
        if (activeNode != null) {
          activeNode.active = true;
        }
        console.log("activeNode", activeNode);
      }

      return root;
    },
    initLayouts() {
      return this.calcLayouts();
    },
  },
  beforeUpdate() {
    if (!this.$refs.container) {
      return;
    }

    var targetEl = this.$refs.pages.querySelector(
      ".split-layout-pages__contener"
    );
    var els = this.$refs.layout.querySelectorAll(".split-layout-page__page");

    console.log("beforeUpdate", els.length);
    Array.from(els).forEach((e, i) => {
      targetEl.appendChild(e);
    });
  },
  render(h) {
    this.$nextTick(() => {
      //this.$emit("layout:begin");

      var tarEls = this.$refs.layout.querySelectorAll(".split-layout__page");

      console.log("nextTick", tarEls.length);
      Array.from(tarEls).forEach((e, i) => {
        const srcView = this.$refs.pages.querySelector(
          ".split-layout-page__page[page=" + e.getAttribute("page") + "]"
        );
        if (!srcView) {
          console.log("nextTick", tarEls);

          return;
        }
        e.appendChild(srcView);
      });

      //this.$emit("layout:complete");
    });

    let renderPages = {};
    const walkRender = (node) => {
      if (node == null) return null;
      switch (node.type) {
        case "root":
          return node.children.map((child) => walkRender(child));
        case "container":
          var children = node.children.map((child) => walkRender(child));
          console.log("container", children);
          return (
            <SplitLayoutContainer
              key={node.id}
              node={node}
              onSetMinimize={this.onSetMinimize}
              onSetPercents={this.onSetPercents}
            >
              {children}
            </SplitLayoutContainer>
          );

        case "tabs":
          var children = node.children.map((child) => walkRender(child));
          console.log("tabs", children);
          return (
            <SplitLayoutTabs
              key={node.id}
              node={node}
              onTabDragStart={this.onTabDragStart}
              onTabClose={this.onTabClose}
            >
              {children}
            </SplitLayoutTabs>
          );

        case "page":
          renderPages[node.id] = node.page;
          return (
            <div
              class={"split-layout__page"}
              active={node.active}
              node-id={node.id}
              page={node.page}
              title={node.title}
            ></div>
          );
      }
    };
    console.log("walkRender this.root", this.root);
    const layoutRender = walkRender(this.root);
    console.log("walkRender layoutRender", layoutRender);

    return (
      <div class="split-layout__container" ref="container">
        <div class="split-layout__layout" ref="layout" node-id={this.root.id}>
          {layoutRender}
        </div>
        <div class="split-layout__preview" ref="preview"></div>
        <div
          class={
            "split-layout__drag " +
            (this.drag ? "split-layout__drag--dragging" : "")
          }
          ref="drag"
          style={{
            transformOrigin:
              this.drag && this.drag.on
                ? this.drag.offset.x + "px " + this.drag.offset.y + "px"
                : "",
          }}
        ></div>
        <div style={{ display: "none" }} ref="pages">
          <SplitLayoutPages
            pages={renderPages}
            key={"pages"}
          ></SplitLayoutPages>
        </div>
      </div>
    );
  },
};
</script>

<style>
.split-layout__container {
  display: flex;
  flex-direction: column;
  flex: 1 0 auto;
  overflow: hidden;
  position: relative;
  height: 100%;
}
.split-layout__layout {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;

  display: flex;
  flex: 1;
  height: 100%;
  width: 100%;
}
.split-layout__preview {
  position: absolute;
  opacity: 0;
  margin: 0;
  pointer-events: none;

  background: rgba(155, 155, 155, 0.4);
}

.split-layout__drag {
  position: absolute;
  margin: 0;
  padding: 0;
  display: none;
  cursor: move;
}
/* child of drag */
.split-layout__drag * {
  pointer-events: none !important;
}

.split-layout__drag--dragging {
  display: block;
}

.split-layout__page {
  display: flex;
  flex: 1;
  height: 100%;
  width: 100%;
}

.simplebar-content {
  height: 100%;
}
</style>