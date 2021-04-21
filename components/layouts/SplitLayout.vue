
<script>
import SplitLayoutPages from "./SplitLayoutPages";
import SplitLayoutTabs from "./SplitLayoutTabs";
import SplitLayoutContainer from "./SplitLayoutContainer";
import SplitLayoutTree from "./SplitLayoutTree.js";
export default {
  props: {
    tabDisabled: { type: Boolean, default: false },
    closeable: { type: Boolean, default: true },
    openable: { type: Boolean, default: true },
    editable: { type: Boolean, default: true },
    groupDragable: { type: Boolean, default: true },

    resizeable: { type: Boolean, default: true },
    volatile: { type: Boolean, default: true },

    layout: { type: Object, default: () => ({}) },

    insertAmount: { type: [String, Number], default: 33 },
    insertPreview: { type: [String, Number], default: 33 },

    outerInsertable: { type: Boolean, default: true },
    outerInsertAmount: { type: [String, Number], default: 33 },
    outerInsertPreview: { type: [String, Number], default: 0 },

    minimizeSize: { type: Number, default: 16 },
    spliterSize: { type: Number, default: 8 },
  },
  components: { SplitLayoutPages, SplitLayoutTabs, SplitLayoutContainer },

  mixins: [SplitLayoutTree],
  data() {
    return {
      root: this.initLayout(),
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
    layout() {
      this.root = this.calcLayout(this.layout);
      this.onSetRect(this.root);
      this.save();
    },
    minimizeSize() {
      this.onSetRect(this.root);
    },
    spliterSize() {
      this.onSetRect(this.root);
    },
  },

  mounted() {
    if (this.$eventHub) {
      this.$eventHub.$on("open-page", this.openPage);
      this.$eventHub.$on("set-layout", this.setLayout);
    }
    window.addEventListener("resize", this.handleResize);
  },

  beforeDestroy() {
    if (this.$eventHub) {
      this.$eventHub.$off("open-page", this.openPage);
      this.$eventHub.$off("set-layout", this.setLayout);
    }
    window.removeEventListener("resize", this.handleResize);
  },
  methods: {
    handleResize() {
      this.onSetRect(this.root);
    },
    onSetRect(node, nextTick) {
      if (node == null) return;
      const nodes = this.findNodes(node, (x) => x.type === "page");
      nodes.forEach((x) => this.$eventHub.$emit("set-rect-" + x.id, nextTick));
    },
    save() {
      if (this.volatile) return;
      localStorage.layout = this.serializeTree(this.root);
    },
    load() {
      if (this.volatile) return;
      return this.deserializeTree(localStorage.layout);
    },
    openPage(args) {
      let { page, unique, title, tabs, scroll, scrollX, scrollY } = args;
      unique = unique ?? page;
      title = title ?? page;
      tabs = tabs ?? true;
      scrollX = scroll ?? scrollX ?? true;
      scrollY = scroll ?? scrollY ?? true;

      const target = this.findNode(this.root, (x) => x.unique === unique);

      if (target != null) {
        if (this.tabDisabled) return;
        this.setTabActive(this.root, target);
      } else {
        if (!this.openable) return;
        const newNode = {
          type: "page",
          id: this.getSequenceId(this.root),
          page,
          unique,
          title,
          active: false,
          tabs,
          scrollX,
          scrollY,
        };
        const parent = this.findNode(
          this.root,
          (x) => x.type === "tabs" && x.active
        );

        if (parent) {
          const insertIndex = parent.children.findIndex((x) => x.active);

          this.attachTabChild(
            this.root,
            parent,
            newNode,
            "center",
            null,
            insertIndex + 1
          );
        } else {
          this.attachTabChild(this.root, this.root, newNode, "center", null);
        }
      }

      this.save();
    },
    onTabDragStart(e) {
      if (e.button !== 0) return;

      const node = this.getNode(this.root, e);
      if (node === undefined) return;

      e.preventDefault();
      e.stopPropagation();

      if (this.tabDisabled) return;

      const beforeActive = node.active;

      this.setTabActive(this.root, node);
      if (!beforeActive) {
        this.onSetRect(node, false);
      }
      this.save();
      if (!this.editable) {
        return;
      }

      //const nextActive = this.getNextActive(this.root, node);
      //console.log("nextActive@", nextActive, this.root, node);
      const containerRect = this.$refs.container.getBoundingClientRect();
      const trect = e.target.getBoundingClientRect(); // Target is draggable

      let dom = e.target;
      dom = this.getAncestorDom(dom, ".split-layout-tabs__header");
      dom = dom.cloneNode(true);
      this.drag = {
        node,
        offset: { x: e.clientX - trect.left, y: e.clientY - trect.top },
        on: false,
        // nextActive,
        dom,
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
        this.stringify = this.serializeTree(this.root);

        const ancestorContainer = this.getAncestorNode(
          this.root,
          this.drag.node,
          (x) => x.type === "container"
        );
        this.root.tempIds = this.flatNodes(this.drag.node).map((x) => x.id);
        this.removeNode(this.root, this.drag.node);

        //console.log("nextActive", this.drag.nextActive);
        // if (this.drag.nextActive != null) {
        //   this.drag.nextActive.active = true;
        // }

        this.onSetRect(ancestorContainer, false);
      }

      this.drag.over = null; // reset over

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
        this.drag = null;
        return;
      }
      this.previewPane(this.$refs.preview, "none");
      if (this.drag.over == null) {
        this.drag = null;
        this.root = this.deserializeTree(this.stringify);
        return;
      }
      var { dom, attach, amount } = this.drag.over;

      let target = undefined;
      let insertIndex = undefined;

      if (dom.matches(".split-layout-tabs__header-space")) {
        dom = this.getAncestorDom(dom, ".split-layout-tabs__tabs");
        const nodeId = Number(
          dom.getAttribute("node-id").replace(/[^0-9]/g, "")
        );
        target = this.findIdNode(this.root, nodeId);
      } else if (dom.matches(".split-layout-tabs__header")) {
        const nodeId = Number(
          dom.getAttribute("node-id").replace(/[^0-9]/g, "")
        );
        const node = this.findIdNode(this.root, nodeId);
        target = this.getParentNode(this.root, node);
        insertIndex = target.children.findIndex((x) => x.id === node.id);
      } else if (dom.matches(".split-layout-tabs__content")) {
        dom = this.getAncestorDom(dom, ".split-layout-tabs__tabs");
        const nodeId = Number(
          dom.getAttribute("node-id").replace(/[^0-9]/g, "")
        );
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

      const ancestorContainer = this.getAncestorNode(
        this.root,
        this.drag.node,
        (x) => x.type === "container"
      );
      this.onSetRect(ancestorContainer, false);

      this.drag = null;
      this.root.tempIds = [];

      this.save();
    },
    onTabClose(e) {
      if (e.button !== 0) return;

      const node = this.getNode(this.root, e);
      if (node === undefined) return;

      //const parent = this.getParentNode(this.root, node);
      const ancestorContainer = this.getAncestorNode(
        this.root,
        node,
        (x) => x.type === "container"
      );

      e.preventDefault();
      e.stopPropagation();

      //let nextActive = this.getNextActive(this.root, node);
      //console.log("onTabClose", nextActive, node, e.target);
      this.removeNode(this.root, node);
      //this.setTabActive(this.root, nextActive);

      this.onSetRect(ancestorContainer, false);

      this.save();
    },
    evacuatePage(node) {
      const nodes = this.findNodes(node, (x) => x.type === "page");

      var targetEl = this.$refs.container.querySelector(
        ".split-layout-pages__contener"
      );

      const els = nodes.map((x) =>
        this.$refs.container.querySelector(
          // `.split-layout-page__page[node-id="${"_" + x.id}"]`
          `.split-layout-page__page[unique="${x.unique}"]`
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
            //`.split-layout__page[node-id="${"_" + x.id}"]`
            `.split-layout__page[unique="${x.unique}"]`
          );
          if (e == null) return;
          const srcView = this.$refs.pages.querySelector(
            //`.split-layout-page__page[node-id="${"_" + x.id}"] `
            `.split-layout-page__page[unique="${x.unique}"] `
          );

          e.appendChild(srcView);
        });
      });
    },
    onClickMinimize(nodeId, type, minimizePercent, spliterPercent) {
      const node = this.findIdNode(this.root, nodeId);
      const parent = this.getParentNode(this.root, node);
      const siblingIndex = parent.children.findIndex(
        (child) => child.id === node.id
      );
      const partitions = this.toPartitions(
        parent.percents,
        parent.minimizes,
        minimizePercent,
        spliterPercent
      );
      let targetIndex = null;

      if (parent.minimizes[siblingIndex].type === "next") {
        for (let i = siblingIndex + 1; i < parent.minimizes.length; i++) {
          if (parent.minimizes[i].type === "none") {
            targetIndex = i;
            break;
          }
        }
      } else if (parent.minimizes[siblingIndex].type === "prev") {
        for (let i = siblingIndex - 1; i >= 0; i--) {
          if (parent.minimizes[i].type === "none") {
            targetIndex = i;
            break;
          }
        }
      }
      let sumOpenPercent = 0;
      if (parent.minimizes[siblingIndex].type === "next") {
        for (let i = siblingIndex; i >= 0; i--) {
          if (parent.minimizes[i].type === "none") {
            break;
          } else {
            let partitionSourcePrevIndex = i;
            let partitionSourceNextIndex = i + 1;
            sumOpenPercent +=
              parent.minimizes[i].percent -
              (partitions[partitionSourceNextIndex] -
                partitions[partitionSourcePrevIndex]);
          }
        }
      } else if (parent.minimizes[siblingIndex].type === "prev") {
        for (let i = siblingIndex; i < parent.minimizes.length; i++) {
          if (parent.minimizes[i].type === "none") {
            break;
          } else {
            let partitionSourcePrevIndex = i;
            let partitionSourceNextIndex = i + 1;
            sumOpenPercent +=
              parent.minimizes[i].percent -
              (partitions[partitionSourceNextIndex] -
                partitions[partitionSourcePrevIndex]);
          }
        }
      }

      const partitionPrevIndex = siblingIndex;
      const partitionNextIndex = siblingIndex + 1;
      const partitionTargetPrevIndex = targetIndex;
      const partitionTargetNextIndex = targetIndex + 1;

      let tolerance = 0.00002;

      if (parent.minimizes[siblingIndex].type === "next") {
        let upperOffset = 0;
        if (partitionTargetNextIndex === partitions.length - 1) {
          upperOffset += spliterPercent / 2;
        }
        for (let i = partitionTargetPrevIndex; i >= partitionNextIndex; i--) {
          upperOffset -= spliterPercent + minimizePercent;
          const upperLimit = partitions[partitionTargetNextIndex] + upperOffset;
          if (partitions[i] + sumOpenPercent >= upperLimit) {
            let childIndex = i;
            parent.minimizes[childIndex].type = "prev";
            parent.minimizes[childIndex].percent =
              tolerance + partitions[i + 1] - partitions[i];
            partitions[childIndex] = upperLimit;
            this.evacuatePage(parent.children[childIndex]);
          } else {
            partitions[i] += sumOpenPercent;
          }
        }
      } else if (parent.minimizes[siblingIndex].type === "prev") {
        let lowerOffset = 0;
        if (partitionTargetPrevIndex === 0) {
          lowerOffset -= spliterPercent / 2;
        }
        for (let i = partitionTargetNextIndex; i <= partitionPrevIndex; i++) {
          lowerOffset += spliterPercent + minimizePercent;
          const lowerLimit = partitions[partitionTargetPrevIndex] + lowerOffset;

          if (partitions[i] - sumOpenPercent <= lowerLimit) {
            let childIndex = i - 1;
            parent.minimizes[childIndex].type = "next";
            parent.minimizes[childIndex].percent =
              tolerance + partitions[i] - partitions[i - 1];
            partitions[i] = lowerLimit;
            this.evacuatePage(parent.children[childIndex]);
          } else {
            partitions[i] -= sumOpenPercent;
          }
        }
      }

      parent.minimizes[siblingIndex].percent = 0;
      parent.minimizes[siblingIndex].type = type;

      const percents = this.toPercents(
        partitions,
        parent.minimizes,
        minimizePercent,
        spliterPercent
      );
      parent.percents = [...percents];

      if (type === "none") {
        this.restorePage(node);
      } else {
        this.evacuatePage(node);
      }
      this.save();
    },
    onSetMinimize(nodeId, type, percent) {
      const node = this.findIdNode(this.root, nodeId);
      const parent = this.getParentNode(this.root, node);
      const siblingIndex = parent.children.findIndex(
        (child) => child.id === node.id
      );

      if (type === "none") {
        parent.minimizes[siblingIndex].percent = 0;
      } else {
        parent.minimizes[siblingIndex].percent = percent;
      }
      parent.minimizes[siblingIndex].type = type;

      if (type === "none") {
        this.restorePage(node);
      } else {
        this.evacuatePage(node);
      }
    },
    onSetPercents(nodeId, percents) {
      const node = this.findIdNode(this.root, nodeId);
      node.percents = [...percents];
    },
    onEndResize() {
      this.save();
    },
    setLayout(layout) {
      this.root = this.calcLayout(layout, this.root);

      this.onSetRect(this.root, false);
      this.save();
    },
    calcLayout(layout, slot) {
      // const getSequenceId = () => {
      //   for (let i = 0; ; i++) {
      //     if (!ids.includes(i)) {
      //       ids.push(i);
      //       return i;
      //     }
      //   }
      // };

      const root = {
        type: "root",
        id: 0,
        ids: [0],
        tempIds: [],
        children: [],
      };
      console.log("calcLayout 1 ", root.ids, slot);
      if (slot && this.someNode(layout, (x) => x.type === "slot")) {
        this.findNodes(layout, (x) => x.hasOwnProperty("page")).forEach((x) =>
          this.findNodes(
            slot,
            (y) =>
              y.type === "page" && (y.unique ?? y.page) === (x.unique ?? x.page)
          ).forEach((y) => this.removeNode(slot, y))
        );
        if (slot.children.length === 1) {
          root.ids.push(...this.flatNodes(slot.children[0]).map((x) => x.id));
        }
      }

      console.log("calcLayout 2 ", root.ids, slot);

      const walkLayout = (node, { parentType, active }) => {
        if (node == null || !node instanceof Object) return undefined;

        let type = "";
        if (node.type === "slot") {
          type = "slot";
        } else if (
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
          case "slot": {
            return {
              type,
              id: -1,
            };
          }
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
              walkLayout(child, { parentType: type })
            );
            return {
              type,
              id: this.getSequenceId(root),
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
              walkLayout(child, {
                parentType: type,
                active: (defaultActive && index === 0) || child.active,
              })
            );
            return {
              type,
              id: this.getSequenceId(root),
              children,
              active: node.active,
            };
          }
          case "page": {
            if (parentType == "tabs" || node.tabs) {
              return {
                type,
                id: this.getSequenceId(root),
                page: node.page,
                unique: node.unique ?? node.page,
                title: node.title ?? node.page,
                active,
                tabs: node.tabs ?? true,
                scrollX: node.scroll ?? node.scrollX ?? true,
                scrollY: node.scroll ?? node.scrollY ?? true,
              };
            } else {
              const children = [
                walkLayout(node, { parentType: "tabs", active: true }),
              ];
              return { type: "tabs", id: this.getSequenceId(root), children };
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

      const child = walkLayout(layout, {});
      const children = [];
      if (child != null) {
        children.push(child);
      }
      root.children = children;
      //if (slot != null) {
      this.setSlotNode(root, slot);
      //}

      const count = this.countNode(root, (x) => x.type === "tabs" && x.active);

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
      } else if (count === 0) {
        const activeNode = this.findNode(root, (x) => x.type === "tabs");
        if (activeNode != null) {
          activeNode.active = true;
        }
      }

      return root;
    },
    initLayout() {
      if (!this.volatile) {
        let retLayout = this.load();
        if (retLayout) {
          return retLayout;
        }
      }

      return this.calcLayout(this.layout);
    },
  },
  beforeUpdate() {
    if (!this.$refs.container) {
      return;
    }

    var parentElement = this.$refs.pages.querySelector(
      ".split-layout-pages__contener"
    );
    var childElements = this.$refs.layout.querySelectorAll(
      ".split-layout-page__page"
    );

    Array.from(childElements).forEach((e) => {
      parentElement.appendChild(e);
    });
  },
  render(h) {
    this.$nextTick(() => {
      var parentElements = this.$refs.layout.querySelectorAll(
        ".split-layout__page"
      );

      Array.from(parentElements).forEach((e) => {
        const childElement = this.$refs.pages.querySelector(
          `.split-layout-page__page[unique=${e.getAttribute("unique")}]`
        );
        if (childElement == null) {
          console.error(
            "split-layout__page has no corresponding element." +
              `.split-layout-page__page[unique=${e.getAttribute("unique")}]`
          );
          return;
        }
        e.appendChild(childElement);
      });

      var el = this.$refs.container.querySelector(".split-layout__drag");
      if (el) {
        while (el.firstChild) {
          el.removeChild(el.firstChild);
        }
        if (el.matches(".split-layout__drag--dragging")) {
          if (this.drag && this.drag.dom && this.drag.over) {
            el.appendChild(this.drag.dom);
          }
        }
      }
    });

    let renderPages = {};
    if (this.drag && this.drag.on && this.drag.node) {
      renderPages[this.drag.node.id] = {
        page: this.drag.node.page,
        unique: this.drag.node.unique,
      };
    }
    const walkRender = (node) => {
      if (node == null) return null;
      switch (node.type) {
        case "root":
          return node.children.map((child) => walkRender(child));
        case "container":
          var children = node.children.map((child) => walkRender(child));
          return (
            <SplitLayoutContainer
              key={node.id}
              node={node}
              resizeable={this.resizeable}
              onClickMinimize={this.onClickMinimize}
              onSetMinimize={this.onSetMinimize}
              onSetPercents={this.onSetPercents}
              onSetRect={this.onSetRect}
              onEndResize={this.onEndResize}
              minimizeSize={this.minimizeSize}
              spliterSize={this.spliterSize}
            >
              {children}
            </SplitLayoutContainer>
          );

        case "tabs":
          var children = node.children.map((child) => walkRender(child));
          return (
            <SplitLayoutTabs
              key={node.id}
              node={node}
              closeable={this.closeable}
              onTabDragStart={this.onTabDragStart}
              onTabClose={this.onTabClose}
              onSetRect={this.onSetRect}
            >
              {children}
            </SplitLayoutTabs>
          );

        case "page":
          renderPages[node.id] = { page: node.page, unique: node.unique };
          return (
            <div
              class={"split-layout__page"}
              active={node.active}
              node-id={"_" + node.id}
              page={node.page}
              unique={node.unique}
              title={node.title}
            ></div>
          );
      }
    };
    const layoutRender = walkRender(this.root);

    return (
      <div class="split-layout__container" ref="container">
        <div
          class="split-layout__layout"
          ref="layout"
          node-id={"_" + this.root.id}
        >
          {layoutRender}
        </div>
        <div class="split-layout__preview" ref="preview"></div>
        <div
          class={
            "split-layout__drag" +
            (this.drag && this.drag.on ? " split-layout__drag--dragging" : "")
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
  position: absolute;
  margin: 0;
  padding: 0;
  display: block;
  cursor: move;
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