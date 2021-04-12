<script>
const minimizeSize = 16;
const spliterSize = 1;
export default {
  props: {
    node: { type: [String, Number, Object], default: () => ({}) },
    resizeable: { type: Boolean, default: true },
  },
  data() {
    return {
      resizing: false,
    };
  },
  methods: {
    toPartitions(percents, minimizes, minimizePerent, spliterPerent) {
      const minimizeCount = minimizes.reduce(
        (acc, x) => (x.type === "none" ? acc : acc + 1),
        0
      );
      const spliterCount = minimizes.length - 1;
      const minimizeSizeLot =
        (minimizePerent * minimizeCount + spliterPerent * spliterCount) /
        (minimizes.length - minimizeCount);

      const percentsReal = percents.map((parcent, i) => {
        if (this.node.minimizes[i].type !== "none") {
          return minimizePerent;
        }

        return parcent - minimizeSizeLot;
      });
      // const startPercentsReal = percents.map((parcent, i) => {
      //   if (this.node.minimizes[i].type !== "none") {
      //     return minimizePerent;
      //   }

      //   let amount = 0;
      //   if (i !== 0) {
      //     amount += spliterPerent / 2;
      //   }
      //   for (let j = i - 1; j >= 0; j--) {
      //     if (this.node.minimizes[j].type === "none") break;
      //     amount += minimizePerent / 2;
      //   }
      //   if (i !== startPercents.length - 1) {
      //     amount += spliterPerent / 2;
      //   }
      //   for (let j = i + 1; j < startPercents.length; j++) {
      //     if (this.node.minimizes[j].type === "none") break;
      //     amount += minimizePerent / 2;
      //   }
      //   return parcent - amount;
      // });
      const partitions = percentsReal
        .reduce(
          (acc, x, i) =>
            acc.concat([
              x +
                acc.slice(-1)[0] +
                (i === 0 || i === percentsReal.lenght - 1
                  ? spliterPerent / 2
                  : spliterPerent),
            ]),
          [0]
        )
        .slice(0, -1)
        .concat(1);
      // console.log("1--toPartitions--");

      // console.log("partitions", partitions);
      // console.log(
      //   "percentsReal",
      //   percentsReal,
      //   percentsReal.reduce((acc, x) => acc + x, 0)
      // );
      // console.log(
      //   "percents",
      //   percents,
      //   percents.reduce((acc, x) => acc + x, 0)
      // );
      return partitions;
    },
    toPercents(partitions, minimizes, minimizePerent, spliterPerent) {
      const percentsReal = partitions
        .slice(1)
        .reduce(
          (acc, x) => acc.concat(x - acc.reduce((sum, y) => sum + y, 0)),
          []
        )
        .map(
          (x, i) =>
            x -
            (i === 0 || i === partitions.lenght - 2
              ? spliterPerent / 2
              : spliterPerent)
        );

      const minimizeCount = minimizes.reduce(
        (acc, x) => (x.type === "none" ? acc : acc + 1),
        0
      );
      const spliterCount = minimizes.length - 1;
      const minimizeSizeLot =
        (minimizePerent * minimizeCount + spliterPerent * spliterCount) /
        (minimizes.length - minimizeCount);

      const percents = percentsReal.map((parcent, i) => {
        if (this.node.minimizes[i].type !== "none") {
          return 0;
        }

        return parcent + minimizeSizeLot;
      });

      // console.log("2--toPercents--");

      // console.log("partitions", partitions);
      // console.log(
      //   "percentsReal",
      //   percentsReal,
      //   percentsReal.reduce((acc, x) => acc + x, 0)
      // );
      // console.log(
      //   "percents",
      //   percents,
      //   percents.reduce((acc, x) => acc + x, 0)
      // );
      return percents;
    },

    openMinimize(index, e) {
      this.$emit("setMinimize", this.node.children[index].id, "none", 0);
    },
    startResize(index, e) {
      if (e.button !== 0 && e.touches == null) return;
      console.log("startResize" + index);

      if (!this.resizeable) return;
      this.resizing = true;

      e.preventDefault();
      e.stopPropagation();

      const h = this.node.dir === "horizontal";
      const clientSize = h ? this.$el.clientWidth : this.$el.clientHeight;
      const minimizePerent = minimizeSize / clientSize;
      const spliterPerent = spliterSize / clientSize;

      const startMinimizes = this.node.minimizes.map((x) => ({ ...x }));
      const startPercents = [...this.node.percents];
      const startPartitions = this.toPartitions(
        this.node.percents,
        this.node.minimizes,
        minimizePerent,
        spliterPerent
      );

      // const startPercentsReal = startPercents.map((parcent, i) => {
      //   if (this.node.minimizes[i].type !== "none") {
      //     return minimizePerent;
      //   }

      //   let amount = 0;
      //   if (i !== 0) {
      //     amount += spliterPerent / 2;
      //   }
      //   for (let j = i - 1; j >= 0; j--) {
      //     if (this.node.minimizes[j].type === "none") break;
      //     amount += minimizePerent / 2;
      //   }
      //   if (i !== startPercents.length - 1) {
      //     amount += spliterPerent / 2;
      //   }
      //   for (let j = i + 1; j < startPercents.length; j++) {
      //     if (this.node.minimizes[j].type === "none") break;
      //     amount += minimizePerent / 2;
      //   }
      //   return parcent - amount;
      // });

      // const startPartitions = startPercents
      //   .reduce(
      //     (acc, x, i) =>
      //       acc.concat([
      //         x +
      //           acc.slice(-1)[0] +
      //           (i === 0 || i === startPercents.lenght - 1
      //             ? spliterPerent / 2
      //             : spliterPerent),
      //       ]),
      //     [0]
      //   )
      //   .slice(0, -1)
      //   .concat(1);

      const drag = (event) => {
        //console.log("drag");
        const mousePos = h ? event.clientX : event.clientY;
        const perentRect = this.$el.getBoundingClientRect();
        const perentRectPos = h ? perentRect.left : perentRect.top;
        const clientSize = h ? this.$el.clientWidth : this.$el.clientHeight;
        const minimizePerent = minimizeSize / clientSize;
        const spliterPerent = spliterSize / clientSize;

        const partitions = this.toPartitions(
          this.node.percents,
          this.node.minimizes,
          minimizePerent,
          spliterPerent
        );

        let upperOffset = spliterPerent;
        const upperAdder = spliterPerent + minimizePerent;
        let lowerOffset = -spliterPerent;
        const lowerAdder = -(spliterPerent + minimizePerent);

        let partition = (mousePos - perentRectPos) / clientSize;

        const partitionIndex = index + 1;
        const partitionUpperLimit =
          1 -
          upperAdder * (partitions.length - partitionIndex - 1) +
          spliterPerent / 2;
        const partitionLowerLimit =
          0 - lowerAdder * partitionIndex - spliterPerent / 2;
        if (partition < partitionLowerLimit) {
          partition = partitionLowerLimit;
        } else if (partition > partitionUpperLimit) {
          partition = partitionUpperLimit;
        }

        // const partitions = this.node.percents
        //   .reduce((acc, x) => acc.concat([x + acc.slice(-1)[0]]), [0])
        //   .slice(0, -1)
        //   .concat(1);

        partitions[partitionIndex] = partition;

        //console.log(this.node.percents, partitions, startPartitions);

        // if (partition > startPartitions[index]) {
        for (let i = partitionIndex + 1; i < startPartitions.length; i++) {
          let j = i - 1;
          upperOffset += upperAdder;
          if (partition + upperOffset >= startPartitions[i]) {
            partitions[i] = partition + upperOffset - spliterPerent;
            if (this.node.minimizes[j].type === "none") {
              this.$emit(
                "setMinimize",
                this.node.children[j].id,
                "prev",
                startPercents[j]
              );
            }
          } else {
            if (
              this.node.minimizes[j].type !== "none" &&
              startMinimizes[j].type === "none"
            ) {
              this.$emit("setMinimize", this.node.children[j].id, "none", 0);
            }
          }
        }
        // } else if (partition < startPartitions[index]) {
        for (let i = partitionIndex - 1; i >= 0; i--) {
          let j = i;
          lowerOffset += lowerAdder;
          if (partition + lowerOffset <= startPartitions[i]) {
            partitions[i] = partition + lowerOffset + spliterPerent;
            if (this.node.minimizes[j].type === "none") {
              this.$emit(
                "setMinimize",
                this.node.children[j].id,
                "next",
                startPercents[j]
              );
            }
          } else {
            if (
              this.node.minimizes[j].type !== "none" &&
              startMinimizes[j].type === "none"
            ) {
              this.$emit("setMinimize", this.node.children[j].id, "none", 0);
            }
          }
        }
        //}
        if (partition > startPartitions[partitionIndex]) {
          let j = partitionIndex - 1;
          if (
            this.node.minimizes[j].type !== "none" &&
            startMinimizes[j].type !== "none"
          ) {
            this.$emit("setMinimize", this.node.children[j].id, "none", 0);
          }
        } else if (partition < startPartitions[partitionIndex]) {
          let j = partitionIndex;
          if (
            this.node.minimizes[j].type !== "none" &&
            startMinimizes[j].type !== "none"
          ) {
            this.$emit("setMinimize", this.node.children[j].id, "none", 0);
          }
        }
        // const percents = partitions
        //   .slice(1)
        //   .reduce(
        //     (acc, x) => acc.concat(x - acc.reduce((sum, y) => sum + y, 0)),
        //     []
        //   );

        const percents = this.toPercents(
          partitions,
          this.node.minimizes,
          minimizePerent,
          spliterPerent
        );
        //console.log(partitions, percents);
        this.$emit("setPercents", this.node.id, percents);
      };

      const drop = (event) => {
        if (event.button !== 0 && event.touches == null) return;
        this.resizing = false;
        document.removeEventListener("mousemove", drag);
        document.removeEventListener("mouseup", drop);
        document.removeEventListener("touchmove", drag);
        document.removeEventListener("touchend", drop);
      };
      document.addEventListener("mousemove", drag);
      document.addEventListener("mouseup", drop);
      document.addEventListener("touchmove", drag);
      document.addEventListener("touchend", drop);
    },
  },
  render(h) {
    //console.log(this.$slots.default.length, this.node.children.length);

    // minimize count
    const minimizeCount = this.node.minimizes.reduce(
      (acc, x) => (x.type === "none" ? acc : acc + 1),
      0
    );
    const spliterCount = this.node.minimizes.length - 1;
    const minimizeSizeLot =
      (minimizeSize * minimizeCount + spliterSize * spliterCount) /
      (this.node.minimizes.length - minimizeCount);

    const items = [];
    for (let i = 0; i < this.$slots.default.length; i++) {
      let last = i === this.$slots.default.length - 1;

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
            ? "down"
            : "up";
        items.push(
          <div
            class={"split-layout-container__minimize-" + this.node.dir}
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
            splitter-id={i}
            on={{
              mousedown: this.startResize.bind(this, i),
              touchstart: this.startResize.bind(this, i),
            }}
          ></div>
        );
      }
    }
    //console.log("split-layout-container__container", this.node);
    return (
      <div class={"split-layout-container__container-" + this.node.dir}>
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
  width: 16px;
}
.split-layout-container__minimize-vertical {
  height: 16px;
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
  flex-basis: 1px;
  position: relative;
  background: rgb(212, 212, 212);
  transition: all 0.3s;
}

.split-layout-container__splitter:hover {
  background: rgba(100, 100, 100, 0.4);
  transition: all 0.3s;
}

.split-layout-container__splitter::after {
  position: absolute;
  content: " ";
  z-index: 10;
  transition: all 0.3s;
  top: -4px;
  right: -4px;
  bottom: -4px;
  left: -4px;
}

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
