import { store } from 'Editor/store'
import { selected, activeArtboard } from 'Editor/store/ui'
import * as consts from 'Editor/scripts/consts'
import * as defaults from 'Client/scripts/defaults'
import * as utilities from 'Editor/scripts/utilities'

let _selected
selected.subscribe(v => _selected = v)

let _activeArtboard
activeArtboard.subscribe(v => _activeArtboard = v)

export function getValue({ group, prop }) {
  if (group) {
    let groupObj

    if (group === 'selected' && _selected.length > 0) {
      groupObj = getSelectedObject()
    } else if (group === 'activeArtboard') {
      groupObj = getObject(_activeArtboard)
    } else {
      groupObj = store.getState().map.present[group]
    }

    let pathComponents = prop.split('.')
    let value = groupObj

    for (let comp of pathComponents) {
      if (value) value = value[comp]
    }

    return copy(value)
  } else {
    return copy(store.getState().map.present[prop])
  }
}

export function getSelectedObject() {
  if (_selected.length === 0 || !getObject(_selected[0])) return

  let obj = getObject(_selected[0])

  if (_selected.length > 1) {
    let selectedObjects = []

    for (let id of _selected) {
      let obj = getObject(id)
      selectedObjects.push(obj)
    }

    // Multiple objects
    obj = sumSettings(selectedObjects)
  }

  let extended

  if (obj.type === consts.OBJECT_ARTBOARD) {
    extended = utilities.deepExtend({}, defaults.artboardDefaults, obj)
  } else {
    extended = utilities.deepExtend({}, defaults.objectDefaults, obj)
  }

  return extended
}

export function getObject(id, arr = store.getState().map.present.artboards) {
  let result

  for (let obj of arr) {
    if (obj.type === consts.OBJECT_ARTBOARD || obj.type === consts.OBJECT_GROUP) {
      result = getObject(id, obj.children)
      if (result) break
    }
    if (obj.id === id) {
      result = obj
      break
    }
  }

  return result
}

export function getAllObjects() {
  let objects = []
  utilities.traverseObjectTree(store.getState().map.present.artboards, 'children', (object, index, parentArray) => {
    objects.push(object)
  })

  return objects
}

export function getChildren({ parent, ignoredTypes = [] }) {
  let children = []
  traverse(parent, o => {
    if (!ignoredTypes.includes(o.type)) children.push(o)
  })

  return children
}

export function isObjectChildOfActiveArtboard(id) {
  return getChildren({ parent: getObject(_activeArtboard) }).filter((o) => o.id === id).length > 0
}

export function getArtboards() {
  return store.getState().map.present.artboards
}

export function getMapDefaults() {
  return utilities.deepExtend({}, defaults.imageMapDefaults, store.getState().map.present.defaults.mapDefaults)
}

export function getArtboardDefaults() {
  return utilities.deepExtend({}, defaults.artboardDefaults, store.getState().map.present.defaults.artboardDefaults)
}

export function getObjectDefaults() {
  return utilities.deepExtend({}, defaults.objectDefaults, store.getState().map.present.defaults.objectDefaults)
}

export function getTooltipContentDefaults() {
  return utilities.deepExtend({}, defaults.tooltipContentDefaults, store.getState().map.present.defaults.tooltipDefaults)
}

export function getMapOriginalDefaults() {
  return defaults.imageMapDefaults
}

export function getArtboardOriginalDefaults() {
  return defaults.artboardDefaults
}

export function getObjectOriginalDefaults() {
  return defaults.objectDefaults
}

export function getTooltipContentOriginalDefaults() {
  return defaults.tooltipContentDefaults
}

export function getSettings() {
  return store.getState().map.present
}

export function getCanUndo() {
  return store.getState().map.past.length > 0
}

export function getCanRedo() {
  return store.getState().map.future.length > 0
}

export function getParent(id, cb) {
  for (let artboard of store.getState().map.present.artboards) {
    traverse(artboard, (obj, parent, index) => {
      if (obj.id === id) {
        cb(parent, index)
      }
    })
  }
}

function copy(v) {
  if (Object.prototype.toString.call(v) === '[object Array]' || typeof (v) == 'object') {
    return structuredClone(v)
  }

  return v
}
function sumSettings(objects) {
  let result = {}

  for (let propName in objects[0]) {
    let prop = objects[0][propName]

    if (Object.prototype.toString.call(prop) === '[object Array]') {
      let values = new Set()

      for (let object of objects) {
        values.add(JSON.stringify(object[propName]))
      }

      result[propName] = values.size > 1 ? [] : prop
    } else if (typeof (prop) === 'object') {
      let innerObjects = []

      for (let object of objects) {
        innerObjects.push(object[propName])
      }

      result[propName] = sumSettings(innerObjects)
    } else {
      let values = new Set()

      for (let object of objects) {
        values.add(object[propName])
      }

      result[propName] = values.size > 1 ? undefined : Array.from(values)[0]
    }
  }

  return result
}
function traverse(obj, cb, parent, index) {
  cb(obj, parent, index)

  if (obj.children) {
    for (let i = 0; i < obj.children.length; i++) {
      traverse(obj.children[i], cb, obj, i)
    }
  }
}