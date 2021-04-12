import Vue from 'vue';
export default {

    methods: {
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
                    break;
                }
                case "page": {
                    this.removeNodePage(root, node);
                    break;
                }
            }
        },
        removeNodePage(root, node) {
            const parent = this.getParentNode(root, node)
            const index = parent.children.findIndex(child => child.id === node.id)
            parent.children.splice(index, 1) // remove child
            if (parent.children.length === 0) {
                this.removeNodeTabs(root, parent);
            }
        },
        removeNodeTabs(root, node) {

            const parent = this.getParentNode(root, node);
            const siblings = parent.children


            if (siblings.length == 1) {
                // last page remove
                console.warn("removeNodeTabs", parent.children.length)
                console.log("removeNodeTabs", siblings.length, parent.type)
                //parent.children.splice(0)
                parent.children.splice(0)
                console.warn("removeNodeTabs", parent.children.length)

                console.warn("removeNodeTabs", root)

            } else if (siblings.length == 2) {

                const siblingIndex = parent.children.findIndex(child => child.id === node.id)
                parent.children.splice(siblingIndex, 1) // remove child
                const [sibling] = parent.children
                const parentParent = this.getParentNode(root, parent);
                const parentIndex = parentParent.children.findIndex(child => child.id === parent.id)
                parentParent.children.splice(parentIndex, 1, sibling)


                if (parentParent.type === "container" && sibling.type === "container" && parentParent.dir === sibling.dir) {
                    // Merge containers of the same dir
                    console.log("removeNodeTabs marge")

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

                        parent.percents[siblingIndex + 1] += percents[siblingIndex]
                        parent.minimizes[siblingIndex + 1].type = "none"

                        if (node.active) {
                            parent.children[siblingIndex + 1].active = true;
                        }

                    } else if (siblingIndex == siblings.length - 1) {

                        parent.percents[siblingIndex - 1] += percents[siblingIndex]
                        parent.minimizes[siblingIndex - 1].type = "none"


                        if (node.active) {
                            parent.children[siblingIndex - 1].active = true;
                        }
                    } else {

                        parent.percents[siblingIndex + 1] += percents[siblingIndex] * 0.5
                        parent.percents[siblingIndex - 1] += percents[siblingIndex] * 0.5
                        parent.minimizes[siblingIndex + 1].type = "none"
                        parent.minimizes[siblingIndex - 1].type = "none"


                        if (node.active) {
                            parent.children[siblingIndex + 1].active = true;
                        }
                    }

                } else {
                    let nextDepth = siblings.length
                    for (let i = siblingIndex + 1; i < siblings.length; i++) {

                        if (!siblings[i].minimize) {
                            nextDepth = i - siblingIndex
                            break
                        }
                    }
                    let prevDepth = siblings.length

                    for (let i = siblingIndex - 1; i >= 0; i--) {
                        if (!siblings[i].minimize) {
                            prevDepth = siblingIndex - i
                            break
                        }
                    }
                    if (nextDepth > prevDepth) {
                        parent.percents[siblingIndex - prevDepth] += parent.percents[siblingIndex]

                    } else if (nextDepth < prevDepth) {

                        parent.percents[siblingIndex + nextDepth] += parent.percents[siblingIndex]
                    } else {

                        parent.percents[siblingIndex - prevDepth] += parent.percents[siblingIndex] * 0.5
                        parent.percents[siblingIndex + nextDepth] += parent.percents[siblingIndex] * 0.5
                    }


                    if (node.active) {
                        if (nextDepth != siblings.length) {
                            parent.children[siblingIndex + nextDepth].active = true;
                        } else {
                            parent.children[siblingIndex - prevDepth].active = true;
                        }
                    }

                }
                parent.children.splice(siblingIndex, 1) // remove child
                parent.minimizes.splice(siblingIndex, 1);
                parent.percents.splice(siblingIndex, 1);

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
            const nodeId = parseInt(target.getAttribute("node-id"), 10);
            if (nodeId === undefined) {
                console.log(" node-id is undefined");
                return undefined;
            }
            return this.findNode(root, (x) => x.id === nodeId);
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
            let siblings = this.getSiblingNodes(root, node);
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
            return nextActive;
        },

        getSequenceId(root) {
            for (let i = 0; ; i++) {
                if (!root.ids.includes(i)) {
                    root.ids.push(i)
                    return i
                }
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

            const siblingIndex = targetParent.children.findIndex(x => x.id === target.id)
            const before = (attach === "up" || attach === "left")

            if (targetParent != null && targetParent.dir === dir) {


                const targetPercent = targetParent.percents[siblingIndex]
                targetParent.percents.splice(siblingIndex, 1, targetPercent * (1 - size))

                const insertIndex = before ? siblingIndex : siblingIndex + 1;

                targetParent.percents.splice(insertIndex, 0, targetPercent * size)
                targetParent.minimizes.splice(insertIndex, 0, { type: "none" })
                targetParent.children.splice(insertIndex, 0, child)
                //console.warn(targetParent)

            } else {
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
                console.log("attachChild", targetParent.children)

            }
            return child
        }



    },
}