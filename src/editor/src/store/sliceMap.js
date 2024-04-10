
import { createSlice } from '@reduxjs/toolkit'
import * as utilities from 'Editor/scripts/utilities'
import * as consts from 'Editor/scripts/consts'
import * as defaults from 'Client/scripts/defaults'

let initialState = utilities.deepExtend({}, defaults.imageMapDefaults)
initialState.id = utilities.uuidv4()
initialState.artboards = [utilities.deepExtend({}, defaults.artboardDefaults)]

export const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    insertObjects: (state, { payload }) => {
      insertItemsInParentAtIndex(state.artboards, { items: payload.objects, parentId: payload.parentId, index: payload.index })
      updateSingleObjectParentsAndFilters(state.artboards)
    },
    moveItems: (state, action) => {
      moveItemsToParentAtIndex(state.artboards, { ids: action.payload.ids, parentId: action.payload.parentId, index: action.payload.index })
      updateSingleObjectParentsAndFilters(state.artboards)
    },
    groupItems: (state, action) => {
      groupTogether(state, action.payload.ids)
      updateSingleObjectParentsAndFilters(state.artboards)
    },
    deleteItems: (state, { payload }) => {
      if (state.artboards.length === 1 && payload.ids.includes(state.artboards[0].id)) return

      for (let id of payload.ids) {
        deleteItem(state.artboards, id)
      }

      updateSingleObjectParentsAndFilters(state.artboards)
    },
    setItemProp: (state, { payload }) => {
      traverse(state.artboards, (obj, index, parent) => {
        if (payload.ids.includes(obj.id)) {
          let path = payload.prop.split('.')

          if (path.length == 1) {
            obj[path[0]] = payload.value
          }
          if (path.length == 2) {
            obj[path[0]][path[1]] = payload.value
          }
          if (path.length == 3) {
            obj[path[0]][path[1]][path[2]] = payload.value
          }
          if (path.length == 4) {
            obj[path[0]][path[1]][path[2]][path[3]] = payload.value
          }
        }
      })

      updateSingleObjectParentsAndFilters(state.artboards)
    },
    setMapProp: (state, { payload }) => {
      if (payload.group) {
        state[payload.group][payload.prop] = payload.value
      } else {
        state[payload.prop] = payload.value
      }
    },
    setMapDefaults: (state, action) => {
      state.defaults.mapDefaults = action.payload
    },
    setArtboardDefaults: (state, action) => {
      state.defaults.artboardDefaults = action.payload
    },
    setObjectDefaults: (state, action) => {
      state.defaults.objectDefaults = action.payload
    },
    setTooltipContentDefaults: (state, action) => {
      state.defaults.tooltipDefaults = action.payload
    },
    updateObjects: (state, { payload }) => {
      updateObjectValues(state.artboards, payload)
      updateSingleObjectParentsAndFilters(state.artboards)
    },
    updateValues: (state, { payload }) => {
      updateMapValues(state, payload)
      updateSingleObjectParentsAndFilters(state.artboards)
    }
  }
})

function traverse(artboards, callback) {
  traverseRecursive(artboards, callback)
}
function traverseRecursive(array, callback) {
  for (let i = 0; i < array.length; i++) {
    let shouldBreak = callback(array[i], i, array)
    if (shouldBreak) return
    if (array[i].children && array[i].children.length > 0) {
      traverseRecursive(array[i].children, callback)
    }
  }
}
function deleteItem(artboards, itemId) {
  let deletedItem
  traverse(artboards, (traversedItem, traversedItemIndex, traversedItemParentArray) => {
    if (traversedItem.id === itemId) {
      deletedItem = traversedItemParentArray.splice(traversedItemIndex, 1)[0]
      return true
    }
  })

  return deletedItem
}
function moveItemsToParentAtIndex(artboards, { ids, parentId, index }) {
  let items = []

  for (let id of ids) {
    items.push(deleteItem(artboards, id))
  }

  insertItemsInParentAtIndex(artboards, { items, parentId, index })
}
function insertItemsInParentAtIndex(artboards, { items, parentId, index = 0 }) {
  if (parentId === null || parentId === undefined) {
    artboards.splice(index, 0, ...items)
    return
  }

  traverse(artboards, (traversedItem, traversedItemIndex, traversedItemParentArray) => {
    if (traversedItem.id === parentId) {
      traversedItem.children.splice(index, 0, ...items)
      return true
    }
  })
}
function groupTogether(state, ids) {
  // Create group at the first item's index
  let newGroup
  traverse(state.artboards, (traversedItem, traversedItemIndex, traversedItemParentArray) => {
    if (traversedItem.id === ids[0]) {
      newGroup = _createGroup(state)
      traversedItemParentArray.splice(traversedItemIndex, 0, newGroup)
      return true
    }
  })

  // Move the items as first child of the new group
  moveItemsToParentAtIndex(state.artboards, { ids: ids, parentId: newGroup.id, index: 0 })
}
function updateObjectValues(artboards, values) {
  traverse(artboards, (item) => {
    if (Object.keys(values).includes(item.id)) {
      for (let propName in values[item.id]) {
        item[propName] = values[item.id][propName]
      }
    }
  })
}
function updateMapValues(state, values) {
  for (let propName in values) {
    state[propName] = values[propName]
  }
}
function updateSingleObjectParentsAndFilters(objects, callback = () => { }, parentId = '', parentObject) {
  for (let obj of objects) {

    // Update the object's parent_id and parent_filters
    if (obj.type !== consts.OBJECT_ARTBOARD) {
      obj.parent_id = parentId
      if (parentId !== '') {
        obj.default_style.parent_filters = parentObject.default_style.filters
        obj.mouseover_style.parent_filters = parentObject.mouseover_style.filters
      } else {
        obj.default_style.parent_filters = []
        obj.mouseover_style.parent_filters = []
      }
    }

    if (obj.children) {

      // Determine the next child's parent_id and parent object
      let childParentId = obj.single_object && parentId === '' ? obj.id : parentId
      let childParentObject = obj.single_object && parentId === '' ? obj : parentObject

      updateSingleObjectParentsAndFilters(obj.children, callback, childParentId, childParentObject)
    }
    if (callback(obj, parent)) break
  }
}

// Create items
function _createGroup(state, id = utilities.uuidv4()) {
  let settings = utilities.deepExtend({}, defaults.objectDefaults, state.defaults.objectDefaults, {
    id,
    type: 'group',
    title: 'Group',
  })

  return settings
}

export const {
  insertObjects,
  moveItems,
  groupItems,
  deleteItems,
  setItemProp,
  setMapProp,
  setMapDefaults,
  setArtboardDefaults,
  setObjectDefaults,
  setTooltipContentDefaults,
  updateObjects,
  updateValues
} = mapSlice.actions
export default mapSlice.reducer