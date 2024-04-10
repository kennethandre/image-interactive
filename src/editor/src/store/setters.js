import { store, getters } from 'Editor/store'
import { selected, activeArtboard, lockSize } from 'Editor/store/ui'
import * as consts from 'Editor/scripts/consts'
import * as mapActions from 'Editor/store/sliceMap'
import * as defaults from 'Client/scripts/defaults'
import * as utilities from 'Editor/scripts/utilities'
import { ActionCreators } from 'redux-undo'
import { previousSelected } from './ui'

let _selected
selected.subscribe(v => _selected = v)
let _previousSelected
previousSelected.subscribe(v => _previousSelected = v)
let _activeArtboard
activeArtboard.subscribe(v => _activeArtboard = v)
let _lockSize
lockSize.subscribe(v => _lockSize = v)

export function setValue({ group, prop, value }) {
  if (group === 'selected') {
    if (_selected.length === 0) return
    let ids = _selected

    // Exception: artboard width/height
    if (getters.getObject(_selected[0]).type === consts.OBJECT_ARTBOARD && _lockSize && (prop === 'width' || prop === 'height')) {
      let artboard = getters.getObject(_selected[0])
      let width = artboard.width
      let height = artboard.height
      if (prop === 'width') {
        width = value
        height = artboard.height * (value / artboard.width)
      }
      if (prop === 'height') {
        width = artboard.width * (value / artboard.height)
        height = value
      }
      let values = {}
      values[_selected[0]] = {
        width,
        height
      }
      setObjectValues(values)
    } else if (getters.getObject(_selected[0]).type === consts.OBJECT_ARTBOARD && prop === 'use_image_size' && value === true) {
      const img = new Image()
      img.onload = () => {
        const values = {}
        values[_selected[0]] = {
          width: img.width,
          height: img.height,
          use_image_size: true
        }
        setObjectValues(values)
      }
      img.src = getters.getObject(_selected[0]).image_url
    } else {
      store.dispatch(mapActions.setItemProp({ ids, prop, value }))
    }

  } else if (group === 'activeArtboard') {
    store.dispatch(mapActions.setItemProp({ ids: [_activeArtboard], prop, value }))
  } else {
    store.dispatch(mapActions.setMapProp({ group, prop, value }))
  }
}

export function setMapValues(values) {
  store.dispatch(mapActions.updateValues(values))
}

export function clearHistory() {
  store.dispatch(ActionCreators.clearHistory())
}

export function setObjectValues(values) {
  store.dispatch(mapActions.updateObjects(values))
}

export function setMapDefaults(v) {
  let obj = utilities.clean(utilities.subtract(v, defaults.imageMapDefaults))
  store.dispatch(mapActions.setMapDefaults(obj))
}

export function setArtboardDefaults(v) {
  let obj = utilities.clean(utilities.subtract(v, defaults.artboardDefaults))
  store.dispatch(mapActions.setArtboardDefaults(obj))
}

export function setObjectDefaults(v) {
  let obj = utilities.clean(utilities.subtract(v, defaults.objectDefaults))
  store.dispatch(mapActions.setObjectDefaults(obj))
}

export function setTooltipContentDefaults(v) {
  let obj = utilities.clean(utilities.subtract(v, defaults.tooltipContentDefaults))
  store.dispatch(mapActions.setTooltipContentDefaults(obj))
}

export function insertObjects({ objects, parentId, index }) {
  if (!parentId && objects[0].type !== consts.OBJECT_ARTBOARD) {
    parentId = store.getState().map.present.artboards[0].id
    if (_selected.length > 0 && getters.getObject(_selected[0]).type === consts.OBJECT_GROUP) {
      parentId = _selected[0]
    }
  }

  store.dispatch(mapActions.insertObjects({ objects, parentId, index }))
}

export function deleteObjects({ ids }) {
  store.dispatch(mapActions.deleteItems({ ids }))
}

export function createSpot({ x, y } = { x: 0, y: 0 }) {
  let id = utilities.uuidv4()

  let obj = utilities.deepExtend({}, defaults.objectDefaults, store.getState().map.present.defaults.objectDefaults, {
    id,
    type: consts.OBJECT_SPOT,
    title: 'Spot',
    x,
    y
  })

  // let parentId = _activeArtboard
  // if (_selected.length > 0 && getters.getObject(_selected[0]).type === consts.OBJECT_GROUP) {
  //   parentId = _selected[0]
  // }

  store.dispatch(mapActions.insertObjects({ objects: [obj], parentId: _activeArtboard, index: 0 }))

  return id
}

export function createRect({ x, y, width, height } = { x: 0, y: 0, width: 25, height: 25 }) {
  let id = utilities.uuidv4()
  let obj = utilities.deepExtend({}, defaults.objectDefaults, store.getState().map.present.defaults.objectDefaults, {
    id,
    type: consts.OBJECT_RECT,
    title: 'Rect',
    x,
    y,
    width,
    height,
    x_image_background: x,
    y_image_background: y
  })

  store.dispatch(mapActions.insertObjects({ objects: [obj], parentId: _activeArtboard, index: 0 }))

  return id
}

export function createOval({ x, y, width, height } = { x: 0, y: 0, width: 25, height: 25 }) {
  let id = utilities.uuidv4()

  let obj = utilities.deepExtend({}, defaults.objectDefaults, store.getState().map.present.defaults.objectDefaults, {
    id,
    type: consts.OBJECT_OVAL,
    title: 'Ellipse',
    x,
    y,
    width,
    height,
    x_image_background: x,
    y_image_background: y
  })

  // let parentId = store.getState().map.present.artboards[0].id
  // if (_selected.length > 0 && getters.getObject(_selected[0]).type === consts.OBJECT_GROUP) {
  //   parentId = _selected[0]
  // }

  store.dispatch(mapActions.insertObjects({ objects: [obj], parentId: _activeArtboard, index: 0 }))

  return id
}

export function createPoly({ x, y, width, height, points } = { x: 0, y: 0, width: 25, height: 25, points: [] }) {
  let id = utilities.uuidv4()

  let obj = utilities.deepExtend({}, defaults.objectDefaults, store.getState().map.present.defaults.objectDefaults, {
    id,
    type: consts.OBJECT_POLY,
    title: 'Poly',
    x,
    y,
    width,
    height,
    points,
    x_image_background: x,
    y_image_background: y,
  })

  // let parentId = store.getState().map.present.artboards[0].id
  // if (_selected.length > 0 && getters.getObject(_selected[0]).type === consts.OBJECT_GROUP) {
  //   parentId = _selected[0]
  // }

  store.dispatch(mapActions.insertObjects({ objects: [obj], parentId: _activeArtboard, index: 0 }))

  return id
}

export function createText({ x, y } = { x: 0, y: 0 }) {
  let id = utilities.uuidv4()

  let obj = utilities.deepExtend({}, defaults.objectDefaults, store.getState().map.present.defaults.objectDefaults, {
    id,
    type: consts.OBJECT_TEXT,
    title: 'Text',
    x,
    y
  })

  // let parentId = store.getState().map.present.artboards[0].id
  // if (_selected.length > 0 && getters.getObject(_selected[0]).type === consts.OBJECT_GROUP) {
  //   parentId = _selected[0]
  // }

  store.dispatch(mapActions.insertObjects({ objects: [obj], parentId: _activeArtboard, index: 0 }))

  return id
}

export function createArtboard() {
  let artboard = utilities.deepExtend({}, defaults.artboardDefaults)
  artboard.id = utilities.uuidv4()
  artboard.title = 'Artboard ' + (store.getState().map.present.artboards.length - 1)

  store.dispatch(mapActions.insertObjects({ objects: [artboard], index: getters.getArtboards().length }))
}

export function groupItems({ ids }) {
  store.dispatch(mapActions.groupItems({ ids }))
}

export function moveItems({ ids, parentId, index }) {
  store.dispatch(mapActions.moveItems({ ids, parentId, index }))
}

export function setSelection(ids) {
  previousSelected.set(selected)
  selected.set(ids)
}

export function clearSelection() {
  selected.set([])
}