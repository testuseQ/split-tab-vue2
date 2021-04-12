// Create better model
// with a class maybe

import cloneDeep from 'lodash/cloneDeep'


export default
  class Tree {
  static gid = 0
  constructor(tree) {
    this.tree = tree || []
  }
  push(node) {
    if (node.id === undefined) {
      node.id = Tree.gid++
    }
    this.tree.push(node)
    return node
  }

  unshift(node) {
    if (node.id === undefined) {
      node.id = Tree.gid++
    }
    this.tree.unshift(node)
    return node
  }
  urlDecode(query) {
    let stringify = decodeURIComponent(query)
    //console.log("stringify", stringify)
    let json = JSON.parse(stringify)
    Tree.gid = json.gid
    let copy = json.copy

    this.tree = copy
    this.tree.forEach(x => {
      if (x.parent != null) {
        x.parent = this.tree.find(y => y.id === x.parent)
      }
    })
    return this.tree
  }
  urlEncode() {

    let copy = this.tree.map(x => {
      let ret = {}
      for (let [key, value] of Object.entries(x)) {

        if (key === "parent" && value) {
          value = value.id
        }
        ret[key] = value
      }
      return ret
    })
    let json = {
      copy: copy,
      gid: Tree.gid,
    }
    let stringify = JSON.stringify(json)
    //console.log("stringify", stringify)
    return encodeURIComponent(stringify)
  }
  deserialize(stringify) {
    //console.log("stringify", stringify)
    let json = JSON.parse(stringify)
    Tree.gid = json.gid
    let copy = json.copy

    this.tree = copy
    this.tree.forEach(x => {
      if (x.parent != null) {
        x.parent = this.tree.find(y => y.id === x.parent)
      }
    })
    return this.tree
  }
  serialize() {

    let copy = this.tree.map(x => {
      let ret = {}
      for (let [key, value] of Object.entries(x)) {

        if (key === "parent" && value) {
          value = value.id
        }
        ret[key] = value
      }
      return ret
    })
    let json = {
      copy: copy,
      gid: Tree.gid,
    }
    let stringify = JSON.stringify(json)
    //console.log("stringify", stringify)
    return stringify
  }
  swap(node, target) {
    let tid = this.tree.indexOf(target)
    let nid = this.tree.indexOf(node)
    [this.tree[tid], this.tree[nid]] = [this.tree[nid], this.tree[tid]];
  }
  insert(node, target, offset = 0) {
    let nid = this.tree.indexOf(node)
    this.tree.splice(nid, 1)
    let tid = this.tree.indexOf(target) + offset
    this.tree.splice(tid, 0, node)
  }
  forEach(func) {
    this.tree.forEach(x => func(x));
  }
  find(func) {
    return this.tree.find(x => func(x));
  }
  some(func) {
    return this.tree.some(x => func(x));
  }
  findById(nodeId) {
    var node = this.tree.find(n => n.id === nodeId)
    return node
  }
  childrenOf(parent) {
    return this.tree.filter(k => k.parent === parent)
  }
  removeTabChild(toRemove) {
    let ci = this.tree.indexOf(toRemove)
    if (ci === -1) { // There is no child
      return
    }
    //console.log(toRemove.parent)
    if (toRemove.parent == null) { // remove Child is last one
      this.tree.splice(ci, 1) // remove child
      return
    }
    let siblingIndex = this.childrenOf(toRemove.parent).indexOf(toRemove)

    this.tree.splice(ci, 1) // remove child
    let siblings = this.childrenOf(toRemove.parent) // Should be only one now
    if (siblings.length == 0) {
      this.removeChild(toRemove.parent);
    }


  }



  removeChild(toRemove) {
    let ci = this.tree.indexOf(toRemove)
    if (ci === -1) {
      return
    }
    if (toRemove.parent == null) {
      this.tree.splice(ci, 1)
      return
    }



    let siblings = this.childrenOf(toRemove.parent)

    // for (let i = 0; i < siblings.length; i++) {
    //   console.warn("siblings", i, siblings[i].minimize)
    // }


    if (siblings.length == 1) {
      // NOP
      this.tree.splice(ci, 1) // remove child

    } else if (siblings.length == 2) {


      this.tree.splice(ci, 1) // remove child
      let [sibling] = this.childrenOf(toRemove.parent)
      sibling.minimize = ""

      this.tree.splice(this.tree.indexOf(sibling), 1) // remove sibling

      let pindex = this.tree.indexOf(toRemove.parent) // find parentIndex
      this.tree[pindex] = sibling // Replace parent with sibling
      sibling.parent = sibling.parent.parent // Set new parent for sibling as grandparent
    } else {
      let siblingIndex = siblings.indexOf(toRemove)

      let allMinimized = true
      for (let i = 0; i < siblings.length; i++) {
        if (i != siblingIndex) {
          if (!siblings[i].minimize) {
            allMinimized = false
            break
          }
        }
      }

      let percents = [0]
        .concat(toRemove.parent.partitions)
        .concat([1])
        .reduce(
          (accumulator, currentValue, currentIndex, array) =>
            accumulator.concat(currentValue - array[currentIndex - 1]),
          []
        )
        .slice(1);

      if (allMinimized) {
        if (siblingIndex == 0) {

          percents[siblingIndex + 1] += percents[siblingIndex]
          siblings[siblingIndex + 1].minimize = ""
        } else if (siblingIndex == siblings.length - 1) {

          percents[siblingIndex - 1] += percents[siblingIndex]
          siblings[siblingIndex - 1].minimize = ""
        } else {

          percents[siblingIndex + 1] += percents[siblingIndex] * 0.5
          percents[siblingIndex - 1] += percents[siblingIndex] * 0.5
          siblings[siblingIndex + 1].minimize = ""
          siblings[siblingIndex - 1].minimize = ""
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
          percents[siblingIndex - prevDepth] += percents[siblingIndex]

        } else if (nextDepth < prevDepth) {

          percents[siblingIndex + nextDepth] += percents[siblingIndex]
        } else {

          percents[siblingIndex - prevDepth] += percents[siblingIndex] * 0.5
          percents[siblingIndex + nextDepth] += percents[siblingIndex] * 0.5
        }

      }
      percents.splice(siblingIndex, 1);
      toRemove.parent.partitions = percents
        .slice(0, -1)
        .reduce((acc, x) => acc.concat([x + acc.slice(-1)[0]]), [0])
        .slice(1);

      this.tree.splice(ci, 1) // remove child
    }
  }


  // removeChild(toRemove) {
  //   let ci = this.tree.indexOf(toRemove)
  //   if (ci === -1) { // There is no child
  //     return
  //   }
  //   //console.log(toRemove.parent)
  //   if (toRemove.parent == null) { // remove Child is last one
  //     this.tree.splice(ci, 1) // remove child
  //     return
  //   }

  //   let siblingIndex = this.childrenOf(toRemove.parent).indexOf(toRemove)

  //   this.tree.splice(ci, 1) // remove child
  //   // Possible slow
  //   let siblings = this.childrenOf(toRemove.parent) // Should be only one now

  //   for (let i = 0; i < siblings.length; i++) {
  //     console.warn("siblings", i, siblings[i].minimize)
  //   }

  //   if (siblings.length == 1) {
  //     // Substitute pindex with sibling
  //     let pindex = this.tree.indexOf(toRemove.parent) // find parentIndex


  //     let [sibling] = siblings;
  //     let siblingIndex = this.tree.indexOf(sibling) // find siblingIndex
  //     this.tree.splice(siblingIndex, 1) // remove sibling
  //     // Swap parent to grand parent
  //     this.tree[pindex] = sibling // Replace parent with sibling
  //     sibling.parent = sibling.parent.parent // Set new parent for sibling as grandparent

  //   } else {
  //     //console.log(toRemove.parent.partitions, siblingIndex)
  //     let allMinimized = true
  //     for (let i = 0; i < siblings.length; i++) {
  //       // if (i != siblingIndex) {
  //       if (!siblings[i].minimize) {
  //         allMinimized = false
  //         break
  //       }
  //       // }
  //     }

  //     if (0 == siblingIndex) {
  //       if (allMinimized) {
  //         siblings[0].minimize = ""
  //       }
  //       toRemove.parent.partitions.splice(siblingIndex, 1)

  //     } else if (toRemove.parent.partitions.length == siblingIndex) {

  //       if (allMinimized) {
  //         siblings[siblings.length - 1].minimize = ""
  //       }
  //       toRemove.parent.partitions.splice(siblingIndex - 1, 1)

  //     } else {

  //       if (allMinimized) {
  //         siblings[siblingIndex - 1].minimize = ""
  //         siblings[siblingIndex].minimize = ""
  //       }

  //       toRemove.parent.partitions[siblingIndex - 1] +=
  //         (toRemove.parent.partitions[siblingIndex] - toRemove.parent.partitions[siblingIndex - 1]) / 2;

  //       toRemove.parent.partitions.splice(siblingIndex, 1)
  //     }

  //     for (let i = 0; i < siblings.length; i++) {
  //       if (i != siblingIndex) {

  //         console.warn("removeChild", i, siblings[i].minimize)
  //       }
  //     }
  //     console.warn("removeChild", toRemove.parent.partitions)
  //   }

  // }
  getRoot() {
    return this.tree.length > 0 ? this.tree[0] : null
  }
  attachTabChild(target, position, child, size = 33) {

    //console.log("attachTabChild");
    if (target == null) {
      let root = this.getRoot()
      console.log("no tab attachTabChild");
      if (root) {

        console.log("no tab attachTabChild root");
        this.attachTabChild(root, position, child, size)


      } else {
        // have target
        if (child.type == 'view') {
          let tabs = this.push({ type: 'tabs', dir: 'tabs', active: true })
          this.push(child).parent = tabs
        } else {
          this.push(child)
        }
      }
      return
    }

    if (position == -1) {// into target tabs

      let siblings = this.childrenOf(target)
      for (let sibling of siblings) {
        sibling.active = false
      }
      child.parent = target
      this.push(child)



    } else {

      let tabs = this.attachChild(target, position, { type: 'tabs', dir: 'tabs', active: true }, size)
      this.forEach(x => {
        if (x.dir === "tabs" && x.id !== tabs.id && x.active)
          x.active = false
      });

      this.push(child)
      child.parent = tabs
    }
  }
  attachChild(target, position, child, size) {
    if (child.id === undefined) {
      child.id = Tree.gid++
    }
    // 33 %
    size = size || 33
    let dir = (position % 2 === 0) ? 'vertical' : 'horizontal'
    var targetI = this.tree.indexOf(target)


    //console.log("attachChild", dir);
    if (target.parent && target.parent.dir == dir) {


      let siblings = this.childrenOf(target.parent)
      let siblingIndex = siblings.indexOf(target)

      child.parent = target.parent

      // let percents = target.parent.partitions.concat([1])
      //   .reduce((acc, x) => acc.concat([x - acc.slice(-1)[0]]), [0]).slice(1);

      let percents = [0]
        .concat(target.parent.partitions)
        .concat([1])
        .reduce(
          (accumulator, currentValue, currentIndex, array) =>
            accumulator.concat(currentValue - array[currentIndex - 1]),
          []
        )
        .slice(1);


      let partitionOffset = [0].concat(target.parent.partitions)[siblingIndex]

      //console.log(target.parent.partitions, siblingIndex)

      if (position === 0 || position === 3) {// insert before target

        let percentSize = percents[siblingIndex] * (size / 100)
        target.parent.partitions.splice(siblingIndex, 0, percentSize + partitionOffset)
        this.tree.splice(targetI, 0, child)
      } else {// insert after target

        let percentSize = percents[siblingIndex] * (1 - (size / 100))
        target.parent.partitions.splice(siblingIndex, 0, percentSize + partitionOffset)
        this.tree.splice(targetI + 1, 0, child)
      }


    } else {

      var newSplit = {
        id: Tree.gid++,
        type: 'split',
        parent: target.parent,
        dir: (position % 2 === 0) ? 'vertical' : 'horizontal'
      }
      // our node parent is the new split
      target.parent = newSplit // detached node parent
      child.parent = newSplit // drag node parent
      this.tree[targetI] = newSplit // Same location as node



      if (position === 0 || position === 3) {
        newSplit.partitions = [(size / 100)]
        this.tree.push(child, target)
      } else {
        newSplit.partitions = [(1 - (size / 100))]
        this.tree.push(target, child)
      }
    }
    return child
  }
}
Tree.from = function (tree) {
  return new Tree(tree)
}
