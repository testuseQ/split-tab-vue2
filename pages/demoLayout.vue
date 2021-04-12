<template>
  <div class="demo-layout">
    <div class="controls">
      <button :class="{ active: state.edit }" @click="toggleEdit">
        editable
      </button>
      <button :class="{ active: state.closeable }" @click="toggleCloseable">
        closeable
      </button>
      <button :class="{ active: state.resize }" @click="toggleResize">
        resizeable
      </button>
      <button
        :class="{ active: state.tabOmitted == 'alone' }"
        @click="toggleAloneTabOmitted"
      >
        alone tab omitted
      </button>
      <button
        :class="{ active: state.tabOmitted == 'all' }"
        @click="toggleAllTabOmitted"
      >
        all tab omitted
      </button>

      <button :class="{ active: state.tabDisabled }" @click="toggleTabDisabled">
        tab disabled
      </button>
      <button
        :class="{ active: state.saveState == 'query' }"
        @click="saveStateQuery"
      >
        save query
      </button>
      <button
        :class="{ active: state.saveState == 'local-storage' }"
        @click="saveStateLocalStorage"
      >
        save local storage
      </button>
      <button
        :class="{ active: state.saveState == 'cookie' }"
        @click="saveStateCookie"
      >
        save cookie
      </button>
      <button @click="changeSplits">Change layout</button>
      <div class="controls-nest">
        <span>insertAmount {{ this.state.insertAmount }}%</span>
        <input v-model="state.insertAmount" type="range" min="10" max="50" />
      </div>
      <div class="controls-nest">
        <span>insertPreview {{ this.state.insertPreview }}%</span>
        <input v-model="state.insertPreview" type="range" min="10" max="50" />
      </div>
    </div>
    <div class="demo-content">
      <SplitLayout
        :tab-omitted="state.tabOmitted"
        :tab-disabled="state.tabDisabled"
        :edit="state.edit"
        :closeable="state.closeable"
        :resize="state.resize"
        :layouts="state.layouts"
        :insert-amount="state.insertAmount"
        :insert-preview="state.insertPreview"
        :save-state="state.saveState"
        :custom-events="state.addSplitView"
      >
      </SplitLayout>
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
        tabOmitted: "",
        tabDisabled: false,
        extraStyle: false,
        edit: true,
        closeable: true,
        resize: true,
        layouts: layouts[0],
        layoutN: 0,
        insertAmount: 50,
        insertPreview: 25,
        tab: true,
        saveState: localStorage.saveState || "",
        customs: this.$router.customs,
      },
    };
  },
  methods: {
    changeSplits() {
      this.state.layoutN = (this.state.layoutN + 1) % layouts.length;
      this.state.layouts = layouts[this.state.layoutN];
    },
    toggleEdit() {
      this.state.edit = !this.state.edit;
    },
    toggleCloseable() {
      this.state.closeable = !this.state.closeable;
    },
    toggleAloneTabOmitted() {
      this.state.tabOmitted = this.state.tabOmitted === "alone" ? "" : "alone";
    },
    toggleAllTabOmitted() {
      this.state.tabOmitted = this.state.tabOmitted === "all" ? "" : "all";
    },
    toggleTabDisabled() {
      this.state.tabDisabled = !this.state.tabDisabled;
    },
    toggleResize() {
      this.state.resize = !this.state.resize;
    },
    toggleBoth() {
      if (this.state.edit || this.state.resize) {
        this.state.edit = this.state.resize = false;
        return;
      }
      this.state.edit = this.state.resize = true;
    },
    toggleStyle() {
      this.state.extraStyle = !this.state.extraStyle;
    },
    saveStateCookie() {
      this.state.saveState = this.state.saveState === "cookie" ? "" : "cookie";
      localStorage.saveState = this.state.saveState;
    },
    saveStateQuery() {
      this.state.saveState = this.state.saveState === "query" ? "" : "query";
      localStorage.saveState = this.state.saveState;
    },
    saveStateLocalStorage() {
      this.state.saveState =
        this.state.saveState === "local-storage" ? "" : "local-storage";
      localStorage.saveState = this.state.saveState;
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
