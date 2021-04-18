<template>
  <div class="demo-layout">
    <div class="controls">
      <button :class="{ active: state.editable }" @click="toggleEditable">
        editable
      </button>
      <button :class="{ active: state.openable }" @click="toggleOpenable">
        openable
      </button>
      <button :class="{ active: state.closeable }" @click="toggleCloseable">
        closeable
      </button>
      <button :class="{ active: state.resizeable }" @click="toggleResizeable">
        resizeable
      </button>
      <button :class="{ active: state.tabDisabled }" @click="toggleTabDisabled">
        tab disabled
      </button>
      <button :class="{ active: state.volatile }" @click="toggleVolatile">
        volatile
      </button>
      <button
        :class="{ active: state.outerInsertable }"
        @click="toggleOuterInsertable"
      >
        outerInsertable
      </button>

      <button @click="changeLayout">Change layout</button>
      <div class="controls-nest">
        <span>insertAmount {{ this.state.insertAmount }}%</span>
        <input v-model="state.insertAmount" type="range" min="10" max="50" />
      </div>
      <div class="controls-nest">
        <span>insertPreview {{ this.state.insertPreview }}%</span>
        <input v-model="state.insertPreview" type="range" min="10" max="50" />
      </div>
      <div class="controls-nest">
        <span>outerInsertAmount {{ this.state.outerInsertAmount }}%</span>
        <input
          v-model="state.outerInsertAmount"
          type="range"
          min="10"
          max="50"
        />
      </div>
      <div class="controls-nest">
        <span>outerInsertPreview {{ this.state.outerInsertPreview }}%</span>
        <input
          v-model="state.outerInsertPreview"
          type="range"
          min="10"
          max="50"
        />
      </div>

      <div class="controls-nest">
        <span>minimizeSize {{ this.state.minimizeSize }}%</span>
        <input v-model="state.minimizeSize" type="range" min="16" max="100" />
      </div>
      <div class="controls-nest">
        <span>spliterSize {{ this.state.spliterSize }}%</span>
        <input v-model="state.spliterSize" type="range" min="1" max="100" />
      </div>
    </div>
    <div class="demo-content">
      <SplitLayout
        :tab-disabled="state.tabDisabled"
        :openable="state.openable"
        :closeable="state.closeable"
        :editable="state.editable"
        :resizeable="state.resizeable"
        :volatile="state.volatile"
        :layouts="state.layouts"
        :insert-amount="Number(state.insertAmount)"
        :insert-preview="Number(state.insertPreview)"
        :outer-insertable="state.outerInsertable"
        :outer-insert-amount="Number(state.outerInsertAmount)"
        :outer-insert-preview="Number(state.outerInsertPreview)"
        :minimize-size="Number(state.minimizeSize)"
        :spliter-size="Number(state.spliterSize)"
      />
    </div>
  </div>
</template>

<script>
const layouts = [
  // layout 0
  {},
  {
    weight: 1,
    page: "testPageA",
  },
  {
    type: "container",
    dir: "horizontal",
    children: [
      {
        type: "tabs",
        weight: 1,
        children: [
          {
            weight: 1,
            type: "page",
            page: "testPageA",
          },
        ],
      },
      {
        type: "tabs",
        weight: 1,
        children: [
          {
            page: "testPageB",
          },
        ],
        active: true,
      },
      {
        type: "tabs",
        weight: 1,
        children: [
          {
            page: "testPageC",
            scroll: false,
          },
        ],
      },

      {
        type: "tabs",
        weight: 1,
        children: [
          {
            page: "testPageD",
          },
        ],
      },

      {
        type: "tabs",
        weight: 1,
        children: [
          {
            page: "testPageE",
          },
        ],
      },
    ],
  },
  {
    type: "container",
    dir: "vertical",
    children: [
      {
        weight: 1,
        page: "testPageA",
      },
      {
        dir: "horizontal",
        children: [
          {
            type: "tabs",
            weight: 1,
            children: [
              {
                page: "testPageB",
              },
              {
                page: "testPageC",
              },
            ],
          },
          {
            weight: 1,
            page: "testPageD",
            tabs: false,
          },
        ],
      },
    ],
  },
];

export default {
  data() {
    return {
      state: {
        tabDisabled: false,
        openable: true,
        closeable: true,

        editable: true,
        resizeable: true,
        volatile: (localStorage.volatile ?? "true") === "true",

        layouts: layouts[0],
        layoutN: 0,

        insertAmount: 50,
        insertPreview: 25,

        outerInsertable: true,
        outerInsertAmount: 33,
        outerInsertPreview: 0,

        minimizeSize: 80,
        spliterSize: 48,
      },
    };
  },
  methods: {
    changeLayout() {
      this.state.layoutN = (this.state.layoutN + 1) % layouts.length;
      this.state.layouts = layouts[this.state.layoutN];
    },
    toggleEditable() {
      this.state.editable = !this.state.editable;
    },
    toggleOpenable() {
      this.state.openable = !this.state.openable;
    },
    toggleCloseable() {
      this.state.closeable = !this.state.closeable;
    },
    toggleTabDisabled() {
      this.state.tabDisabled = !this.state.tabDisabled;
    },
    toggleResizeable() {
      this.state.resizeable = !this.state.resizeable;
    },
    toggleVolatile() {
      this.state.volatile = !this.state.volatile;
      localStorage.volatile = this.state.volatile.toString();
    },
    toggleOuterInsertable() {
      this.state.outerInsertable = !this.state.outerInsertable;
    },
  },
};
</script>
<style>
.container {
  width: 100%;
  height: 100%;
}
.controls {
  background: rgb(39, 39, 39);
  color: #fff;
  display: flex;
  font-size: 0.75em;
  width: 100%;
}
.demo-layout {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.demo-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.controls .controls-nest {
  display: flex;
  flex-direction: column;
}

.controls button {
  position: relative;
  cursor: pointer;
  padding: 5px 5px;
  margin-top: 1px;
  margin-bottom: 1px;
  margin-left: 5px;
  margin-right: 5px;
  color: #fff;
  outline: none;
  border: solid 1px transparent;
  background: rgba(250, 250, 250, 0.2);
  transition: all 0.3s;
}

.controls button:hover {
  background: rgba(250, 250, 250, 0.5);
}

.controls button::after {
  position: absolute;
  border-radius: 30px;
  left: 50%;
  right: 50%;
  bottom: 5px;
  height: 1px;
  content: " ";
  background: rgb(255, 255, 255);
  transition: all 0.3s;
}

.controls button.active::after {
  left: 10%;
  right: 10%;
}
</style>
