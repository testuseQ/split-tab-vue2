<script>
import SplitLayoutTree from "./SplitLayoutTree.js";
export default {
  props: {
    node: { type: [String, Number, Object], default: () => ({}) },
    resizeable: { type: Boolean, default: true },
    minimizeSize: { type: Number, default: 80 },
    spliterSize: { type: Number, default: 48 },
    spliterExtendSize: { type: Number, default: 4 },
  },
  mixins: [SplitLayoutTree],
  data() {
    return {
      resizing: false,
    };
  },
  methods: {
    canEdit(e) {
      if (e.button !== 0 && e.touches == null) return;

      const h = this.node.dir === "horizontal";
      const clientSize = h ? this.$el.clientWidth : this.$el.clientHeight;

      const minimizeCount = this.node.minimizes.length;
      const spliterCount = this.node.minimizes.length - 1;
      const fixSize =
        this.minimizeSize * minimizeCount + this.spliterSize * spliterCount;

      if (clientSize <= fixSize) {
        e.stopPropagation();
      }
    },
    openMinimize(index, e) {
      if (!this.resizeable) return;
      const h = this.node.dir === "horizontal";
      const clientSize = h ? this.$el.clientWidth : this.$el.clientHeight;
      const minimizePercent = this.minimizeSize / clientSize;
      const spliterPercent = this.spliterSize / clientSize;
      this.$emit(
        "clickMinimize",
        this.node.children[index].id,
        "none",
        minimizePercent,
        spliterPercent
      );

      this.$emit("setRect", this.node, true);
    },
    startResize(index, e) {
      if (e.button !== 0 && e.touches == null) return;

      if (!this.resizeable) return;
      this.resizing = true;

      e.preventDefault();
      e.stopPropagation();

      const h = this.node.dir === "horizontal";
      const clientSize = h ? this.$el.clientWidth : this.$el.clientHeight;
      const minimizePercent = this.minimizeSize / clientSize;
      const spliterPercent = this.spliterSize / clientSize;

      const startMinimizes = this.node.minimizes.map((x) => ({ ...x }));
      const startPercents = [...this.node.percents];
      const startPartitions = this.toPartitions(
        this.node.percents,
        this.node.minimizes,
        minimizePercent,
        spliterPercent
      );

      const drag = (event) => {
        const mousePos = h ? event.clientX : event.clientY;
        const percentRect = this.$el.getBoundingClientRect();
        const percentRectPos = h ? percentRect.left : percentRect.top;
        const clientSize = h ? this.$el.clientWidth : this.$el.clientHeight;
        const minimizePercent = this.minimizeSize / clientSize;
        const spliterPercent = this.spliterSize / clientSize;

        const partitions = this.toPartitions(
          this.node.percents,
          this.node.minimizes,
          minimizePercent,
          spliterPercent
        );

        let upperOffset = 0;
        const upperAdder = spliterPercent + minimizePercent;
        let lowerOffset = 0;
        const lowerAdder = -(spliterPercent + minimizePercent);

        let partition = (mousePos - percentRectPos) / clientSize;

        let tolerance = 0.00002;
        const partitionIndex = index + 1;
        const partitionUpperLimit =
          1 -
          (spliterPercent + minimizePercent) *
            (partitions.length - partitionIndex - 1) +
          spliterPercent / 2 +
          tolerance;
        const partitionLowerLimit =
          0 +
          (spliterPercent + minimizePercent) * partitionIndex -
          spliterPercent / 2 -
          tolerance;
        let overLowerLimitTolerance = 0;
        let overUpperLimitTolerance = 0;
        if (partition < partitionLowerLimit + tolerance) {
          overLowerLimitTolerance = partitionLowerLimit + tolerance - partition;
          if (overLowerLimitTolerance > tolerance)
            overLowerLimitTolerance = tolerance;
        } else if (partition > partitionUpperLimit - tolerance) {
          overUpperLimitTolerance =
            partition - (partitionUpperLimit - tolerance);
          if (overUpperLimitTolerance > tolerance)
            overUpperLimitTolerance = tolerance;
        }

        if (partition < partitionLowerLimit) {
          partition = partitionLowerLimit;
        } else if (partition > partitionUpperLimit) {
          partition = partitionUpperLimit;
        }

        partitions[partitionIndex] =
          partition + overLowerLimitTolerance - overUpperLimitTolerance;

        for (let i = partitionIndex + 1; i < startPartitions.length; i++) {
          let j = i - 1;
          upperOffset += upperAdder;
          if (i === startPartitions.length - 1)
            upperOffset -= spliterPercent / 2;
          if (partition + upperOffset >= startPartitions[i]) {
            partitions[i] = partition + upperOffset - overUpperLimitTolerance;
            if (this.node.minimizes[j].type === "none") {
              this.$emit(
                "setMinimize",
                this.node.children[j].id,
                "prev",
                startMinimizes[j].type === "none"
                  ? startPartitions[i] - startPartitions[i - 1]
                  : startMinimizes[j].percent
              );
            } else if (this.node.minimizes[j].type === "next") {
              this.$emit(
                "setMinimize",
                this.node.children[j].id,
                "prev",
                startMinimizes[j].percent
              );
            }
          } else {
            partitions[i] = startPartitions[i];
            if (
              this.node.minimizes[j].type !== "none" &&
              startMinimizes[j].type === "none"
            ) {
              this.$emit("setMinimize", this.node.children[j].id, "none", 0);
            } else if (
              startMinimizes[j].type === "next" &&
              this.node.minimizes[j].type === "prev"
            ) {
              this.$emit(
                "setMinimize",
                this.node.children[j].id,
                "next",
                startMinimizes[j].percent
              );
            }
          }
        }
        for (let i = partitionIndex - 1; i >= 0; i--) {
          let j = i;
          lowerOffset += lowerAdder;
          if (i === 0) lowerOffset += spliterPercent / 2;

          if (partition + lowerOffset <= startPartitions[i]) {
            partitions[i] = partition + lowerOffset + overLowerLimitTolerance;

            if (this.node.minimizes[j].type === "none") {
              this.$emit(
                "setMinimize",
                this.node.children[j].id,
                "next",
                startMinimizes[j].type === "none"
                  ? startPartitions[i + 1] - startPartitions[i]
                  : startMinimizes[j].percent
              );
            } else if (this.node.minimizes[j].type === "prev") {
              this.$emit(
                "setMinimize",
                this.node.children[j].id,
                "next",
                startMinimizes[j].percent
              );
            }
          } else {
            partitions[i] = startPartitions[i];
            if (
              this.node.minimizes[j].type !== "none" &&
              startMinimizes[j].type === "none"
            ) {
              this.$emit("setMinimize", this.node.children[j].id, "none", 0);
            } else if (
              startMinimizes[j].type === "prev" &&
              this.node.minimizes[j].type === "next"
            ) {
              this.$emit(
                "setMinimize",
                this.node.children[j].id,
                "prev",
                startMinimizes[j].percent
              );
            }
          }
        }
        if (partitions[partitionIndex] > startPartitions[partitionIndex]) {
          let j = partitionIndex - 1;
          if (
            this.node.minimizes[j].type !== "none" &&
            startMinimizes[j].type !== "none" &&
            partitions[partitionIndex] - partitions[partitionIndex - 1] >
              minimizePercent +
                (partitionIndex - 1 === 0
                  ? spliterPercent / 2
                  : spliterPercent) +
                tolerance
          ) {
            this.$emit("setMinimize", this.node.children[j].id, "none", 0);
          }
        } else if (
          partitions[partitionIndex] < startPartitions[partitionIndex]
        ) {
          let j = partitionIndex;
          if (
            this.node.minimizes[j].type !== "none" &&
            startMinimizes[j].type !== "none" &&
            partitions[partitionIndex + 1] - partitions[partitionIndex] >
              minimizePercent +
                (partitionIndex + 1 === partitions.length - 1
                  ? spliterPercent / 2
                  : spliterPercent) +
                tolerance
          ) {
            this.$emit("setMinimize", this.node.children[j].id, "none", 0);
          }
        }

        const percents = this.toPercents(
          partitions,
          this.node.minimizes,
          minimizePercent,
          spliterPercent
        );
        this.$emit("setPercents", this.node.id, percents);
        this.$emit("setRect", this.node, true);
      };

      const drop = (event) => {
        if (event.button !== 0 && event.touches == null) return;
        this.resizing = false;
        document.removeEventListener("mousemove", drag);
        document.removeEventListener("mouseup", drop);
        document.removeEventListener("touchmove", drag);
        document.removeEventListener("touchend", drop);
        this.$emit("endResize");
      };
      document.addEventListener("mousemove", drag);
      document.addEventListener("mouseup", drop);
      document.addEventListener("touchmove", drag);
      document.addEventListener("touchend", drop);
    },
  },
  render(h) {
    const minimizeCount = this.node.minimizes.reduce(
      (acc, x) => (x.type === "none" ? acc : acc + 1),
      0
    );
    const spliterCount = this.node.minimizes.length - 1;
    const minimizeSizeLot =
      (this.minimizeSize * minimizeCount + this.spliterSize * spliterCount) /
      (this.node.minimizes.length - minimizeCount);

    const items = [];
    for (let i = 0; i < this.$slots.default.length; i++) {
      let last = i === this.$slots.default.length - 1;

      if (this.node.minimizes[i] == null) {
        console.log("!!error!!", this.node, i);
      }

      if (this.node.minimizes[i].type === "none") {
        if (last) {
          items.push(
            <div class="split-layout-container__content">
              {this.$slots.default[i]}
            </div>
          );
        } else {
          items.push(
            <div
              class="split-layout-container__content"
              attrs={{
                style: `flex-basis: calc(${
                  this.node.percents[i] * 100
                }% - ${minimizeSizeLot}px)`,
              }}
            >
              {this.$slots.default[i]}
            </div>
          );
        }
      } else if (
        this.node.minimizes[i].type === "prev" ||
        this.node.minimizes[i].type === "next"
      ) {
        let icon =
          this.node.dir === "horizontal"
            ? this.node.minimizes[i].type === "prev"
              ? "left"
              : "right"
            : this.node.minimizes[i].type === "prev"
            ? "up"
            : "down";
        items.push(
          <div
            class={"split-layout-container__minimize-" + this.node.dir}
            attrs={{
              style: `${this.node.dir === "horizontal" ? "width" : "height"}: ${
                this.minimizeSize
              }px;`,
            }}
            on={{
              mousedown: this.openMinimize.bind(this, i),
              touchstart: this.openMinimize.bind(this, i),
            }}
          >
            <div class="split-layout-container__minimize-button-wrap">
              <div class="split-layout-container__minimize-button">
                <div class={"split-layout-container__" + icon + "-icon"}></div>
              </div>
            </div>
          </div>
        );
      }
      if (!last) {
        items.push(
          <div
            class="split-layout-container__splitter"
            attrs={{
              style: `flex-basis: ${this.spliterSize}px;`,
            }}
            splitter-id={i}
            on={{
              mousedown: this.startResize.bind(this, i),
              touchstart: this.startResize.bind(this, i),
            }}
          >
            <div
              class="split-layout-container__splitter-handle"
              attrs={{
                style:
                  `top: -${this.spliterExtendSize}px;` +
                  `right: -${this.spliterExtendSize}px;` +
                  `bottom: -${this.spliterExtendSize}px;` +
                  `left: -${this.spliterExtendSize}px;`,
              }}
            ></div>
          </div>
        );
      }
    }
    return (
      <div
        class={"split-layout-container__container-" + this.node.dir}
        node-id={"_" + this.node.id}
        on={{
          "!mousedown": this.canEdit,
        }}
      >
        {items}
      </div>
    );
  },
};
</script>

<style>
.split-layout-container__container-horizontal,
.split-layout-container__container-vertical {
  display: flex;
  /* flex: 1; */
  height: 100%;
  width: 100%;
  background: transparent;
}

.split-layout-container__container-horizontal {
  flex-direction: row;
}
.split-layout-container__container-vertical {
  flex-direction: column;
}

.split-layout-container__content {
  position: relative;
  display: flex;
  /* box-sizing: border-box; */
  overflow: hidden;
}

.split-layout-container__content > * {
  flex: 1;
  height: 100%;
}

.split-layout-container__content:last-child {
  flex: 1;
}
.split-layout-container__minimize-horizontal,
.split-layout-container__minimize-vertical {
  background: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
}

.split-layout-container__minimize-horizontal {
  height: 100%;
}
.split-layout-container__minimize-vertical {
  width: 100%;
}

.split-layout-container__minimize-horizontal:hover,
.split-layout-container__minimize-vertical:hover {
  background-color: #d8d9da;
  transition: background-color 0.2s;
}

.split-layout-container__minimize-button {
  display: flex;
  margin-left: auto;
  align-items: center;
}

.split-layout-container__splitter {
  position: relative;
  background: rgb(212, 212, 212);
  transition: all 0.3s;
}

.split-layout-container__splitter:hover {
  background: rgba(100, 100, 100, 0.4);
  transition: all 0.3s;
}

/* .split-layout-container__splitter::after {
  position: absolute;
  content: " ";
  z-index: 10;
  transition: all 0.3s;
  top: -4px;
  right: -4px;
  bottom: -4px;
  left: -4px;
} */
.split-layout-container__splitter-handle {
  position: absolute;
  content: " ";
  z-index: 10;
  transition: all 0.1s;
  /* transition-delay: 0.5s;
  transition-property: background; */
}
/* 
.split-layout-container__splitter-handle:hover {
  background: rgb(0, 127, 212);
} */
.split-layout-container__container-horizontal
  > .split-layout-container__splitter {
  cursor: ew-resize;
}

.split-layout-container__container-vertical
  > .split-layout-container__splitter {
  cursor: ns-resize;
}

.split-layout-container__left-icon,
.split-layout-container__right-icon,
.split-layout-container__up-icon,
.split-layout-container__down-icon {
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

.split-layout-container__left-icon::after,
.split-layout-container__left-icon::before,
.split-layout-container__right-icon::after,
.split-layout-container__right-icon::before,
.split-layout-container__up-icon::after,
.split-layout-container__up-icon::before,
.split-layout-container__down-icon::after,
.split-layout-container__down-icon::before {
  content: "";
  position: absolute;
  display: inline-block;

  top: 50%;
  left: 50%;
  width: 60%;
  height: 0.015em;
  margin: -4% 0 0 -40%;
  border: 0;
  padding: 0;
  border-radius: 0.015em;
  background-color: currentcolor;
}
.split-layout-container__right-icon::before {
  transform: translate(0.02em, 0.03em) rotate(-45deg);
}
.split-layout-container__right-icon::after {
  transform: translate(0.02em, -0.03em) rotate(45deg);
}
.split-layout-container__left-icon::before {
  transform: translate(0em, 0.03em) rotate(45deg);
}
.split-layout-container__left-icon::after {
  transform: translate(0em, -0.03em) rotate(-45deg);
}

.split-layout-container__up-icon::before {
  transform: translate(0.05em, -0.01em) rotate(45deg);
}
.split-layout-container__up-icon::after {
  transform: translate(-0.01em, -0.01em) rotate(-45deg);
}
.split-layout-container__down-icon::before {
  transform: translate(0.05em, 0.01em) rotate(-45deg);
}
.split-layout-container__down-icon::after {
  transform: translate(-0.01em, 0.01em) rotate(45deg);
}
</style>
