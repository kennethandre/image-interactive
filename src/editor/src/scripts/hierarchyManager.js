/*
  This script is an abstraction of a tree
  It handles things like traversing, prev/next item, tree shaking, etc
*/

export default class HierarchyManager {

  model = []
  items = []
  collapsedCache = {}
  visibleCache = {}

  constructor(initModel) {
    this.init(initModel)
  }
  init(initModel) {
    this.model = {
      id: null,
      title: 'root',
      index: 0,
      path: undefined,
      children: structuredClone(initModel),
    }
    this._createItemsArray()
    this._setPaths()
    this._setVisibility()
  }

  traverse(callback) {
    this._traverseRecursive(this.model.children, false, callback)
  }
  getItem(id) {
    let result = this.model
    this.traverse(obj => {
      if (obj.id === id) result = obj
    })
    return result
  }
  getParent(id) {
    return this.getItem(this.getItem(id).path.split('.').pop())
  }
  getVisibleTreeOfItems(ids) {
    let children = []
    for (let id of ids) {
      children = [...children, ...this._getVisibleTree(id)]
    }
    return children
  }
  getNext(id) {
    let testNextObject = false
    let item = this.getItem(id)
    let result = undefined

    this.traverse((traverseItem, visible) => {
      if (testNextObject && !result) {
        switch (item.type) {
          case 'artboard':
            if (traverseItem.type === 'artboard') result = traverseItem
            break
          default:
            if (traverseItem.type === 'artboard' && traverseItem.collapsed) return
            if (!visible) return
            if (traverseItem.path.search(item.id) !== -1) return
            result = traverseItem
        }
      }

      if (traverseItem.id === id) testNextObject = true
    })

    return result
  }
  getPrev(id) {
    let item = this.getItem(id)
    let prevItem = undefined
    let prevArtboard = undefined
    let result = undefined

    this.traverse((traverseItem, visible) => {
      if (traverseItem.id === id && (prevItem || prevArtboard) && !result) {
        switch (item.type) {
          case 'artboard':
            result = prevArtboard
            break
          default:
            result = prevItem
        }
      }

      switch (item.type) {
        case 'artboard':
          if (traverseItem.type === 'artboard') prevArtboard = traverseItem
          break
        default:
          if (!visible) return
          if (traverseItem.type === 'artboard' && traverseItem.index === 0) return
          if (traverseItem.type === 'artboard' && this.getPrev(traverseItem.id).collapsed) return

          prevItem = traverseItem
      }
    })

    return result
  }
  toggle(id) {
    let item = this.getItem(id)
    item.collapsed = !item.collapsed
    this.collapsedCache[item.id] = item.collapsed
  }
  setVisible({ id, visible }) {
    this.getItem(id).visible = visible
    this.visibleCache[id] = visible
  }
  expandAll() {
    this.traverse(item => {
      item.collapsed = false
    })
  }
  moveItemsUp(idsOriginal) {
    let ids = [...idsOriginal]
    let secondaryItems = []
    let primaryItemId = ids.splice(0, 1)[0]

    for (let id of ids) {
      secondaryItems.push(this._delete(id))
    }

    this._moveUp(primaryItemId)

    let mainItemParent = this.getParent(primaryItemId)
    let mainItem = this.getItem(primaryItemId)
    mainItemParent.children.splice(mainItem.index + 1, 0, ...secondaryItems)

    this._setPaths()
  }
  moveItemsDown(idsOriginal) {
    let ids = [...idsOriginal]
    let secondaryItems = []
    let primaryItemId = ids.splice(0, 1)[0]

    for (let id of ids) {
      secondaryItems.push(this._delete(id))
    }

    this._moveDown(primaryItemId)

    let mainItemParent = this.getParent(primaryItemId)
    let mainItem = this.getItem(primaryItemId)
    mainItemParent.children.splice(mainItem.index + 1, 0, ...secondaryItems)

    this._setPaths()
  }
  moveItemsLeft(idsOriginal) {
    let ids = [...idsOriginal]
    let secondaryItems = []
    let primaryItemId = ids.splice(0, 1)[0]

    for (let id of ids) {
      secondaryItems.push(this._delete(id))
    }

    this._moveLeft(primaryItemId)

    let mainItemParent = this.getParent(primaryItemId)
    let mainItem = this.getItem(primaryItemId)
    mainItemParent.children.splice(mainItem.index + 1, 0, ...secondaryItems)

    this._setPaths()
  }
  moveItemsRight(idsOriginal) {
    let ids = [...idsOriginal]
    let secondaryItems = []
    let primaryItemId = ids.splice(0, 1)[0]

    for (let id of ids) {
      secondaryItems.push(this._delete(id))
    }

    this._moveRight(primaryItemId)

    let mainItemParent = this.getParent(primaryItemId)
    let mainItem = this.getItem(primaryItemId)
    mainItemParent.children.splice(mainItem.index + 1, 0, ...secondaryItems)

    this._setPaths()
  }
  gather({ mainItemId, itemIds }) {
    let gatheredItems = []

    // if the main item is a child of any of the items,
    // gathering around it will be impossible
    // in that case, just pick the first item from itemIds
    // it's guaranteed to not be a child of any of the itemIds
    if (!itemIds.includes(mainItemId)) mainItemId = itemIds[0]

    // collect all items in an array
    this.traverse((traversedItem) => {
      if (itemIds.includes(traversedItem.id)) {
        gatheredItems.push(traversedItem)
      }
    })

    // delete all items, except the main item
    for (let item of gatheredItems) {
      if (item.id !== mainItemId) this._delete(item.id)
    }
    this._setPaths()

    // save main item index and parent, then delete it
    let index = this.getItem(mainItemId).index
    let parent = this.getParent(mainItemId)
    this._delete(mainItemId)
    this._setPaths()

    // insert the whole collection at the main item's index
    parent.children.splice(index, 0, ...gatheredItems)
    this._setPaths()
  }
  sort(ids) {
    let result = []
    this.traverse(item => {
      if (ids.includes(item.id)) {
        result.push(item.id)
      }
    })
    return result
  }
  getRange(startId, endId) {
    let result = []
    let inRange = false
    this.traverse((item, visible) => {
      if (inRange || (item.id === startId || item.id === endId)) {
        if ((item.id === startId || item.id === endId)) {
          inRange = !inRange
        }

        if (item.type === 'artboard') return
        if (!visible) return
        if (item.type === 'group' && !item.collapsed) return

        result.push(item.id)
      }
    })
    return result
  }
  shakeTree(ids) {
    let shakedIds = []
    this.traverse((traversedItem) => {
      if (!ids.includes(traversedItem.id)) return
      if (this._isGrandchild(traversedItem.id, ids)) return

      shakedIds.push(traversedItem.id)
    })
    return shakedIds
  }
  moveInto({ itemIds, parentId }) {
    let items = []
    this.traverse(traversedItem => {
      if (itemIds.includes(traversedItem.id)) {
        items.push(traversedItem)
      }
    })

    for (let item of items) {
      this._delete(item.id)
    }

    this.getItem(parentId).children.splice(0, 0, ...items)
    this._setPaths()
  }

  _getVisibleTree(id) {
    let item = this.getItem(id)
    let children = [item]
    if (item.children && !item.collapsed) {
      for (let child of item.children) {
        if (child.type === 'group') {
          children = [...children, ...this._getVisibleTree(child.id)]
        } else {
          children.push(child)
        }
      }
    }

    return children
  }
  _createItemsArray() {
    this.items = []
    this.traverse(obj => {
      this.items.push(obj)
      obj.visible = this.visibleCache[obj.id] !== undefined ? this.visibleCache[obj.id] : true
    })
  }
  _setPaths() {
    this._setPathsRecursive(this.model.children, '0')
  }
  _setPathsRecursive(array, parentPath) {
    for (let i = 0; i < array.length; i++) {
      array[i].path = parentPath
      array[i].index = i
      if (array[i].children && array[i].children.length > 0) this._setPathsRecursive(array[i].children, array[i].path + '.' + array[i].id)
    }
  }
  _setVisibility() {
    this.traverse(obj => {
      if (obj.type === 'artboard' || obj.type === 'group') {
        if (this.collapsedCache[obj.id] === true) {
          obj.collapsed = true
        } else {
          obj.collapsed = false
        }
      }
    })
  }

  _traverseRecursive(arr, parentIsCollapsed, callback) {
    for (let obj of arr) {
      let visible = !parentIsCollapsed && obj.visible ? true : false
      callback(obj, visible)
      if (obj.children && obj.children.length > 0) this._traverseRecursive(obj.children, obj.collapsed || parentIsCollapsed, callback)
    }
  }
  _moveUp(id) {
    let item = this.getItem(id)
    let parent = this.getParent(id)
    let prev = this.getPrev(id)
    if (!prev) return
    let prevParent = this.getParent(prev.id)

    parent.children.splice(item.index, 1)

    if (item.type === 'artboard') {
      prevParent.children.splice(prev.index, 0, item)
      this._setPaths()
      return
    }

    if (item.type !== 'artboard' && prev.type === 'artboard') {
      let artboardBeforePrev = this.getPrev(prev.id)
      artboardBeforePrev.children.splice(artboardBeforePrev.children.length, 0, item)
      this._setPaths()
      return
    }

    prevParent.children.splice(prev.index, 0, item)
    this._setPaths()
  }
  _moveDown(id) {
    let item = this.getItem(id)
    let parent = this.getParent(id)
    let next = this.getNext(id)
    if (!next) return
    let nextParent = this.getParent(next.id)

    parent.children.splice(item.index, 1)

    if (item.type !== 'artboard' && ((next.type === 'artboard' || next.type === 'group') && !next.collapsed)) {
      next.children.splice(0, 0, item)
      this._setPaths()
      return
    }

    if (item.type !== 'artboard' && next.path !== item.path) {
      nextParent.children.splice(next.index + 1, 0, item)
      this._setPaths()
      return
    }

    nextParent.children.splice(next.index, 0, item)
    this._setPaths()
  }
  _moveLeft(id) {
    let item = this.getItem(id)
    let parent = this.getParent(id)

    if (item.index < parent.children.length - 1) return
    if (!parent || parent.type !== 'group') return

    let parentOfParent = this.getParent(parent.id)
    if (!parentOfParent) return

    parent.children.splice(item.index, 1)
    parentOfParent.children.splice(parent.index + 1, 0, item)
    this._setPaths()
  }
  _moveRight(id) {
    let item = this.getItem(id)
    let parent = this.getParent(id)
    let prev = parent.children[item.index - 1]
    if (!prev) return

    if (prev.type === 'group' && !prev.collapsed) {
      parent.children.splice(item.index, 1)
      prev.children.splice(prev.children.length, 0, item)
      this._setPaths()
    }
  }
  _delete(id) {
    let result
    this.traverse((traversedItem) => {
      if (traversedItem.id === id) {
        let parent = this.getParent(traversedItem.id)
        result = parent.children.splice(traversedItem.index, 1)[0]
      }
    })

    this._setPaths()
    return result
  }
  _isGrandchild(id, parentIds) {
    let itemPath = this.getItem(id).path

    for (let parentId of parentIds) {
      if (itemPath.indexOf(parentId) !== -1) return true
    }

    return false
  }
}