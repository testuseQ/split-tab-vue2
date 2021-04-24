import Vue from 'vue';
export default {

    methods: {


        toPartitions(percents, minimizes, minimizePercent, spliterPercent) {
            const minimizeCount = minimizes.reduce(
                (acc, x) => (x.type === "none" ? acc : acc + 1),
                0
            );
            const spliterCount = minimizes.length - 1;
            const minimizeSizeLot =
                (minimizePercent * minimizeCount + spliterPercent * spliterCount) /
                (minimizes.length - minimizeCount);

            const percentsReal = percents.map((parcent, i) => {
                if (minimizes[i].type !== "none") {
                    return minimizePercent;
                }

                return parcent - minimizeSizeLot;
            });
            const partitions = percentsReal
                .reduce(
                    (acc, x, i) =>
                        acc.concat([
                            x +
                            acc.slice(-1)[0] +
                            (i === 0 || i === percentsReal.length - 1
                                ? spliterPercent / 2
                                : spliterPercent),
                        ]),
                    [0]
                )
                .slice(0, -1)
                .concat(1);
            return partitions;
        },
        toPercents(partitions, minimizes, minimizePercent, spliterPercent) {
            const percentsRealTemp = partitions
                .slice(1)
                .reduce(
                    (acc, x) => acc.concat(x - acc.reduce((sum, y) => sum + y, 0)),
                    []
                );
            const percentsReal = percentsRealTemp.map((x, i) => {
                if (i === 0 || i === percentsRealTemp.length - 1) {
                    return x - spliterPercent / 2;
                } else {
                    return x - spliterPercent;
                }
            });

            const minimizeCount = minimizes.reduce(
                (acc, x) => (x.type === "none" ? acc : acc + 1),
                0
            );
            const spliterCount = minimizes.length - 1;
            const minimizeSizeLot =
                (minimizePercent * minimizeCount + spliterPercent * spliterCount) /
                (minimizes.length - minimizeCount);

            const percents = percentsReal.map((parcent, i) => {
                if (minimizes[i].type !== "none") {
                    return 0;
                }

                return parcent + minimizeSizeLot;
            });
            return percents;
        },


        checkAttach(targetDom, e, amount = 33) {
            var size = amount / 100;
            var trect = targetDom.getBoundingClientRect();
            var tW = trect.width * size;
            var tH = trect.height * size;
            var rPos = { x: e.clientX - trect.left, y: e.clientY - trect.top };

            // Calc dists and check the closest one
            var poses = [
                { attach: "up", pos: rPos.y - tH },
                { attach: "right", pos: trect.width - tW - rPos.x },
                { attach: "down", pos: trect.height - tH - rPos.y },
                { attach: "left", pos: rPos.x - tW },
            ];
            // only matches if less than 0
            var min = 0;
            var attach = "center";
            poses.forEach((x) => {
                if (x.pos < min) {
                    min = x.pos;
                    attach = x.attach;
                }
            });
            return attach;
        },
        previewPane(predom, attach, targetDom, amount) {
            if (attach === "none") {
                predom.style.opacity = 0;
                predom.style.transition = "none";
                if (predom.hasAttribute("trans")) {
                    predom.removeAttribute("trans");
                }
                return;
            }
            if (targetDom === undefined) {
                return -1;
            }
            const size = amount / 100;

            // Precalc styles
            const targetRect = targetDom.getBoundingClientRect();
            const previewPos = {
                left: targetRect.left,
                top: targetRect.top,
                width: targetRect.width,
                height: targetRect.height,
            };
            if (attach !== "center") {
                if (attach === "up" || attach === "down") {
                    if (attach === "down") {
                        previewPos.top += previewPos.height - previewPos.height * size;
                    }
                    previewPos.height *= size;
                } else if (attach === "left" || attach === "right") {
                    if (attach === "right") {
                        previewPos.left += previewPos.width - previewPos.width * size;
                    }
                    previewPos.width *= size;
                }
            }

            // Update DOM style TODO
            if (!predom.hasAttribute("trans")) {
                predom.setAttribute("trans", "first");

                predom.style.transition = "all";
                predom.style.position = "fixed";
            } else {
                let trans = predom.getAttribute("trans");
                if (trans == "first") {
                    predom.setAttribute("trans", "second");
                } else if (trans == "second") {
                    predom.style.transition = "all 0.3s";
                    predom.style.opacity = 1;
                    predom.setAttribute("trans", "end");
                }
            }

            for (const k in previewPos) {
                predom.style[k] = previewPos[k] + "px";
            }
        },






        serializeTree(root) {
            return JSON.stringify(root)
        },
        deserializeTree(stringify) {
            return JSON.parse(stringify)
        },
        removeNode(root, node) {
            switch (node.type) {
                case "root": {
                    // NOP
                    break;
                }
                case "container": {

                    break;
                }
                case "tabs": {
                    this.removeNodeTabs(root, node)
                    break;
                }
                case "page": {
                    this.removeNodePage(root, node);
                    break;
                }
                case "slot": {
                    this.removeNodeTabs(root, node)
                    break;
                }
            }
        },
        removeNodePage(root, node) {
            const parent = this.getParentNode(root, node)
            const index = parent.children.findIndex(child => child.id === node.id)

            const nextActive = this.getNextActive(root, node);
            parent.children.splice(index, 1) // remove child
            this.setTabActive(root, nextActive);

            const removeIds = this.flatNodes(node).map((x) => x.id);
            root.ids = root.ids.filter(x => !removeIds.includes(x))
            if (parent.children.length === 0) {
                this.removeNodeTabs(root, parent);
            }
        },
        removeNodeTabs(root, node) {


            const removeIds = this.flatNodes(node).map((x) => x.id);
            root.ids = root.ids.filter(x => !removeIds.includes(x))

            const parent = this.getParentNode(root, node);
            const siblings = parent.children

            console.log("ids", root.ids)


            if (siblings.length == 1) {
                // last page remove
                console.warn("removeNodeTabs", parent.children.length)
                //parent.children.splice(0)
                //root.ids = root.ids.filter(x => x !== siblings[0].id)
                parent.children.splice(0)
                console.warn("removeNodeTabs", parent.children.length)

                console.warn("removeNodeTabs", root)

            } else if (siblings.length == 2) {

                const siblingIndex = parent.children.findIndex(child => child.id === node.id)

                //root.ids = root.ids.filter(x => x !== node.id)
                parent.children.splice(siblingIndex, 1) // remove child
                const [sibling] = parent.children
                const parentParent = this.getParentNode(root, parent);
                const parentIndex = parentParent.children.findIndex(child => child.id === parent.id)

                root.ids = root.ids.filter(x => x !== parent.id)
                parentParent.children.splice(parentIndex, 1, sibling)


                if (parentParent.type === "container" && sibling.type === "container" && parentParent.dir === sibling.dir) {
                    // Merge containers of the same dir
                    const parentParsent = parentParent.percents[parentIndex]

                    parentParent.percents = [
                        ...parentParent.percents.slice(0, parentIndex),
                        ...sibling.percents.map(x => x * parentParsent),
                        ...parentParent.percents.slice(parentIndex + 1)]

                    parentParent.minimizes = [

                        ...parentParent.minimizes.slice(0, parentIndex),
                        ...sibling.minimizes.map(x => {
                            if (x.type !== "none") {
                                return {
                                    type: x.type,
                                    percent: x.percent * parentParsent
                                }
                            } else {
                                return x
                            }

                        }),
                        ...parentParent.minimizes.slice(parentIndex + 1)

                    ]
                    root.ids = root.ids.filter(x => x !== sibling.id)
                    parentParent.children = [
                        ...parentParent.children.slice(0, parentIndex),
                        ...sibling.children,
                        ...parentParent.children.slice(parentIndex + 1)
                    ]
                }



                if (node.active) {
                    sibling.active = true;
                }


            } else {
                const siblingIndex = parent.children.findIndex(child => child.id === node.id)
                const allMinimized = parent.minimizes.every((x, i) => i === siblingIndex || x.type !== "none")

                if (allMinimized) {
                    if (siblingIndex == 0) {

                        parent.percents[siblingIndex + 1] += parent.percents[siblingIndex]
                        parent.minimizes[siblingIndex + 1].type = "none"

                        if (node.active) {
                            parent.children[siblingIndex + 1].active = true;
                        }

                    } else if (siblingIndex == siblings.length - 1) {

                        parent.percents[siblingIndex - 1] += parent.percents[siblingIndex]
                        parent.minimizes[siblingIndex - 1].type = "none"


                        if (node.active) {
                            parent.children[siblingIndex - 1].active = true;
                        }
                    } else {

                        parent.percents[siblingIndex + 1] += parent.percents[siblingIndex] * 0.5
                        parent.percents[siblingIndex - 1] += parent.percents[siblingIndex] * 0.5
                        parent.minimizes[siblingIndex + 1].type = "none"
                        parent.minimizes[siblingIndex - 1].type = "none"


                        if (node.active) {
                            parent.children[siblingIndex + 1].active = true;
                        }
                    }

                    root.ids = root.ids.filter(x => x !== node.id)
                    parent.children.splice(siblingIndex, 1) // remove child
                    parent.minimizes.splice(siblingIndex, 1);
                    parent.percents.splice(siblingIndex, 1);
                } else {

                    let nextDepth = siblings.length
                    for (let i = siblingIndex + 1; i < siblings.length; i++) {

                        if (parent.minimizes[i].type === "none") {
                            nextDepth = i - siblingIndex
                            break
                        }
                    }
                    let prevDepth = siblings.length
                    for (let i = siblingIndex - 1; i >= 0; i--) {
                        if (parent.minimizes[i].type === "none") {
                            prevDepth = siblingIndex - i
                            break
                        }
                    }

                    const parentDom = this.getNodeDom(parent, this.$el);
                    const h = parent.dir === "horizontal";
                    const clientSize = parentDom == null ? 10000 : (h ? parentDom.clientWidth : parentDom.clientHeight);
                    const minimizePercent = this.minimizeSize / clientSize;
                    const spliterPercent = this.spliterSize / clientSize;
                    const partitions = this.toPartitions(
                        parent.percents,
                        parent.minimizes,
                        minimizePercent,
                        spliterPercent
                    );
                    const partitionPervIndex = siblingIndex;
                    const partitionNextIndex = siblingIndex + 1;



                    // const partitionPrevIndex = siblingIndex - prevDepth;
                    // const partitionNextIndex = siblingIndex + nextDepth;
                    let prevPercent = 0;
                    let nextPercent = 0;

                    if (nextDepth > prevDepth) {
                        prevPercent = (partitions[partitionNextIndex] - partitions[partitionPervIndex])
                    } else if (nextDepth < prevDepth) {
                        nextPercent = (partitions[partitionNextIndex] - partitions[partitionPervIndex])
                    } else {
                        prevPercent = (partitions[partitionNextIndex] - partitions[partitionPervIndex]) * 0.5
                        nextPercent = (partitions[partitionNextIndex] - partitions[partitionPervIndex]) * 0.5
                    }
                    if (nextDepth >= prevDepth) {
                        for (let i = partitionPervIndex - 1; i > partitionPervIndex - prevDepth; i--) {
                            partitions[i] += prevPercent
                        }
                    }
                    if (nextDepth <= prevDepth) {
                        for (let i = partitionNextIndex + 1; i < partitionNextIndex + nextDepth; i++) {
                            partitions[i] += nextPercent
                        }
                    }
                    if (nextDepth > prevDepth) {
                        partitions.splice(partitionPervIndex, 1);
                    } else if (nextDepth < prevDepth) {
                        partitions.splice(partitionNextIndex, 1);
                    } else {
                        let midPartition = (partitions[partitionNextIndex] + partitions[partitionPervIndex]) * 0.5
                        partitions.splice(partitionPervIndex, 2, midPartition);
                    }

                    if (node.active) {
                        if (nextDepth !== parent.children.length) {
                            parent.children[siblingIndex + nextDepth].active = true;
                        } else {
                            parent.children[siblingIndex - prevDepth].active = true;
                        }
                    }

                    //root.ids = root.ids.filter(x => x !== node.id)
                    parent.children.splice(siblingIndex, 1) // remove child
                    parent.minimizes.splice(siblingIndex, 1);

                    const percents = this.toPercents(
                        partitions,
                        parent.minimizes,
                        minimizePercent,
                        spliterPercent
                    );
                    parent.percents = [...percents];
                }

            }
        },

        getAncestorDom(dom, selector, guard) {
            let cur = dom
            for (
                ;
                cur &&
                cur.matches &&
                !cur.matches(selector);
                cur = cur.parentNode
            ) {
                if (guard != null && cur.matches(guard)) {
                    return undefined;
                }


            }
            return cur
        },

        getNodeDom(node, dom) {
            switch (node.type) {
                case "root":
                    return dom.querySelector(`.split-layout__layout[node-id=${"_" + node.id}]`)
                case "container":
                    return dom.querySelector(`.split-layout-container__container-${node.dir}[node-id=${"_" + node.id}]`)
                case "tabs":
                    return dom.querySelector(`.split-layout-tabs__tabs[node-id=${"_" + node.id}]`)
                case "page":
                    return dom.querySelector(`.split-layout__page[node-id=${"_" + node.id}]`)
            }
        },


        getNode(root, e) {
            let target = e.target;
            for (
                ;
                target && !target.hasAttribute("node-id");
                target = target.parentNode
            ) { }
            if (!target || !target.hasAttribute || !target.hasAttribute("node-id")) {
                console.log("must has node-id");
                return undefined;
            }
            const nodeId = Number(target.getAttribute("node-id").replace(/[^0-9]/g, ''));
            if (nodeId === undefined) {
                console.log(" node-id is undefined");
                return undefined;
            }

            console.log("getNode", nodeId, target, e.target);
            return this.findNode(root, (x) => x.id === nodeId);
        },
        flatNodes(node) {
            const ret = []
            this.walkNode(node, (x) => ret.push(x))
            return ret
        },

        walkNode(node, action) {
            const walk = (x) => {
                action(x);
                if (x.children == null) return
                x.children.forEach((child) => {
                    walk(child);
                });
            };
            walk(node);
        },
        countNode(node, test) {
            let count = 0
            this.walkNode(node, x => { if (test(x)) { count++ } })
            return count
        },
        someNode(node, test) {
            let hit = false
            this.walkNode(node, x => { if (test(x)) { hit = true } })
            return hit
        },
        everyNode(node, test) {
            let hit = true
            this.walkNode(node, x => { if (!test(x)) { hit = false } })
            return hit
        },


        findIdNode(root, id) {
            return this.findNode(root, x => x.id === id)
        },
        findNode(node, test) {
            let ret = undefined;
            const walk = (x) => {
                if (ret !== undefined) return
                if (test(x)) {
                    ret = x;
                    return;
                }
                if (x.children == null) return
                x.children.forEach((child) => {
                    walk(child);
                });
            };
            walk(node);
            return ret;
        },
        findNodes(node, test) {
            let ret = [];
            const walk = (x) => {
                if (test(x)) {
                    ret.push(x);
                }
                if (x.children == null) return
                x.children.forEach((child) => {
                    walk(child);
                });
            };
            walk(node);
            return ret;
        },


        getParentNode(root, node) {
            let ret = undefined;
            const walk = (x, parent) => {
                if (ret !== undefined) return
                if (x.id === node.id) {
                    ret = parent
                    return
                }
                if (x.children == null) return
                x.children.forEach((child) => {
                    walk(child, x);
                });
            };
            walk(root);
            return ret;
        },
        getSiblingNodes(root, node) {
            const parent = this.getParentNode(root, node)
            if (parent === undefined) {
                return [root];
            } else {
                return parent.children;
            }
        },
        getAncestorNode(root, node, test) {

            let ret = undefined
            let hit = false
            const walk = (x) => {
                if (ret !== undefined) return
                if (hit) return
                if (node.id === x.id) {
                    hit = true
                    if (test(x)) {
                        ret = x
                    }
                    return
                }
                if (x.children == null) return
                x.children.forEach((child) => {
                    walk(child);
                });
                if (ret !== undefined) return
                if (!hit) return
                if (test(x)) {
                    ret = x
                }
            };
            walk(root);
            return ret;
        },

        setTabsActive(root, node) {
            if (node == null) return;
            let tabNode = this.getAncestorNode(
                root,
                node,
                (x) => x.type === "tabs"
            );

            this.$set(tabNode, "active", true)
            this.walkNode(root, (x) => {
                if (x.type === "tabs" && x.id !== tabNode.id && x.active) {
                    //tabNode.active = false
                    this.$set(x, "active", false)
                }
            });
        },
        setTabActive(root, node) {
            if (node == null) return;
            let tabNode = this.getAncestorNode(
                root,
                node,
                (x) => x.type === "tabs"
            );
            //tabNode.active = true
            this.$set(tabNode, "active", true)
            this.walkNode(root, (x) => {
                if (x.type === "tabs" && x.id !== tabNode.id && x.active) {
                    //tabNode.active = false
                    this.$set(x, "active", false)
                }
            });
            let siblings = tabNode.children;
            for (let sibling of siblings) {
                if (node.id === sibling.id) {
                    //tabNode.active = true
                    this.$set(sibling, "active", true)
                } else {
                    //tabNode.active = false
                    this.$set(sibling, "active", false)
                }
            }
            //this.stringify = this.serializeTree(root)
            // fource update
            //this.$forceUpdate()
            //this.$set(root, "children", [...root.children])
            //root.children = [...root.children]
        },
        getNextActive(root, node) {
            let nextActive = undefined;
            if (node.active == null || node.active === false) return nextActive


            let siblings = this.getSiblingNodes(root, node);
            console.log("getNextActive before", root, node, siblings, node.active)
            if (siblings.length > 1) {
                if (!node.active) {
                    nextActive = siblings.find(sibling => sibling.active);
                } else {
                    if (siblings[siblings.length - 1].id === node.id) {
                        nextActive = siblings[siblings.length - 2];
                    } else {
                        let hit = false;
                        for (let sibling of siblings) {
                            if (hit) {
                                nextActive = sibling;
                                break;
                            }
                            if (sibling.id === node.id) {
                                hit = true;
                            }
                        }
                    }
                }
            }
            console.log("getNextActive after", nextActive)
            return nextActive;
        },

        getSequenceId(root) {
            for (let i = 0; ; i++) {
                if (!root.ids.includes(i)) {
                    //    if (!root.ids.includes(i) && !root.tempIds.includes(i)) {
                    root.ids.push(i)
                    return i
                }
            }
        },
        setSlotNode(root, slot) {
            const slotNode = this.findNode(root, (x) => x.type === "slot");
            if (slotNode == null) return;
            if (slot.children.length !== 1) {
                this.removeNode(root, slotNode)
                console.log("setSlotNode", root, slotNode, slot)
                return
            }
            const [child] = slot.children

            const parent = this.getParentNode(root, slotNode)

            if (parent.type === "container") {
                if (child.type === "container" && parent.dir === child.dir) {
                    // Merge containers of the same dir
                    const slotIndx = parent.children.findIndex(x => x.id === slotNode.id)
                    const slotParsent = parent.percents[slotIndx]

                    parent.percents = [
                        ...parent.percents.slice(0, slotIndx),
                        ...child.percents.map(x => x * slotParsent),
                        ...parent.percents.slice(slotIndx + 1)]

                    parent.minimizes = [

                        ...parent.minimizes.slice(0, slotIndx),
                        ...child.minimizes.map(x => {
                            if (x.type !== "none") {
                                return {
                                    type: x.type,
                                    percent: x.percent * slotParsent
                                }
                            } else {
                                return x
                            }

                        }),
                        ...parent.minimizes.slice(slotIndx + 1)

                    ]
                    parent.children = [
                        ...parent.children.slice(0, slotIndx),
                        ...child.children,
                        ...parent.children.slice(slotIndx + 1)
                    ]

                } else {

                    const slotIndx = parent.children.findIndex(x => x.type === "slot")
                    parent.children = [
                        ...parent.children.slice(0, slotIndx),
                        child,
                        ...parent.children.slice(slotIndx + 1)
                    ]

                }
            } else if (parent.type === "tabs") {

                const slotIndx = parent.children.findIndex(x => x.type === "slot")
                parent.children = [
                    ...parent.children.slice(0, slotIndx),
                    child,
                    ...parent.children.slice(slotIndx + 1)
                ]
            }
        },
        attachGroupDrag(root, target, child, attach, amount, insertIndex) {

            if (attach == 'center' || target.type === 'root' && target.children.length === 0) {// into target tabs
                console.log("to root")
                insertIndex = insertIndex ?? target.children.length
                if (target.type === 'root') {

                    target.children.splice(insertIndex, 0, child)
                    const [activeChild] = child.children.filter(x => x.active)
                    this.setTabActive(root, activeChild)
                } else {

                    this.root.ids = this.root.ids.filter(x => x !== child.id)
                    target.children.splice(insertIndex, 0, ...child.children)
                    const [activeChild] = child.children.filter(x => x.active)
                    this.setTabActive(root, activeChild)
                }
            } else {

                if (target.type === 'root' && target.children.length !== 0) {
                    [target] = target.children
                }
                this.attachChild(root, target, child, attach, amount)
                const [activeChild] = child.children.filter(x => x.active)
                this.setTabActive(root, activeChild)
            }
        },
        attachTabChild(root, target, child, attach, amount, insertIndex) {

            if (attach == 'center' || target.type === 'root' && target.children.length === 0) {// into target tabs
                insertIndex = insertIndex ?? target.children.length
                if (target.type === 'root') {
                    target.children.splice(insertIndex, 0, { type: 'tabs', id: this.getSequenceId(root), active: true, children: [child] })

                    this.setTabActive(root, child)
                } else {

                    target.children.splice(insertIndex, 0, child)
                    this.setTabActive(root, child)
                }
            } else {

                if (target.type === 'root' && target.children.length !== 0) {

                    [target] = target.children
                }



                this.attachChild(root, target, { type: 'tabs', id: this.getSequenceId(root), active: true, children: [child] }, attach, amount)

                this.setTabActive(root, child)
            }
        },

        attachChild(root, target, child, attach, amount) {
            const size = amount / 100
            const dir = (attach === "up" || attach === "down") ? 'vertical' : 'horizontal'
            const targetParent = this.getParentNode(root, target);
            const before = (attach === "up" || attach === "left")

            if (targetParent.type === "root" && target.dir === dir) {

                target.percents = target.percents.map(x => x * (1 - size))
                const insertIndex = before ? 0 : target.percents.length + 1;

                target.percents.splice(insertIndex, 0, size)
                target.minimizes.splice(insertIndex, 0, { type: "none" })
                target.children.splice(insertIndex, 0, child)



            } else if (targetParent != null && targetParent.dir === dir) {


                const siblingIndex = targetParent.children.findIndex(x => x.id === target.id)
                const insertIndex = before ? siblingIndex : siblingIndex + 1;



                const parentDom = this.getNodeDom(targetParent, this.$el);
                const h = parent.dir === "horizontal";
                const clientSize = h ? parentDom.clientWidth : parentDom.clientHeight;
                const minimizePercent = this.minimizeSize / clientSize;
                const spliterPercent = this.spliterSize / clientSize;
                const partitions = this.toPartitions(
                    targetParent.percents,
                    targetParent.minimizes,
                    minimizePercent,
                    spliterPercent
                );
                const partitionPervIndex = siblingIndex;
                const partitionNextIndex = siblingIndex + 1;
                let percent = (partitions[partitionNextIndex] - partitions[partitionPervIndex])
                let partition = partitions[partitionPervIndex] + (before ? size : 1 - size) * percent
                partitions.splice(partitionNextIndex, 0, partition);

                targetParent.minimizes.splice(insertIndex, 0, { type: "none" })
                targetParent.children.splice(insertIndex, 0, child)
                const percents = this.toPercents(
                    partitions,
                    targetParent.minimizes,
                    minimizePercent,
                    spliterPercent
                );
                targetParent.percents = [...percents];




                // const targetPercent = targetParent.percents[siblingIndex]

                // targetParent.percents.splice(siblingIndex, 1, targetPercent * (1 - size))

                // const insertIndex = before ? siblingIndex : siblingIndex + 1;

                // targetParent.percents.splice(insertIndex, 0, targetPercent * size)
                // targetParent.minimizes.splice(insertIndex, 0, { type: "none" })
                // targetParent.children.splice(insertIndex, 0, child)
                //console.warn(targetParent)

            } else {
                const siblingIndex = targetParent.children.findIndex(x => x.id === target.id)
                let container = {
                    type: 'container',
                    id: this.getSequenceId(root),
                    dir,
                    percents: before ? [size, 1 - size] : [1 - size, size],
                    minimizes: [{ type: "none", percent: 0 }, { type: "none", percent: 0 }],
                    children: before ? [child, target] : [target, child],
                }
                //this.$set(targetParent.children[siblingIndex], 'time', null)
                //targetParent.children.splice(siblingIndex, 1, container)
                //let tmp = {}

                //targetParent.children.splice(siblingIndex, 1, tmp)
                this.$set(targetParent.children, siblingIndex, JSON.parse(JSON.stringify(container)))


            }
            return child
        }



    },
}