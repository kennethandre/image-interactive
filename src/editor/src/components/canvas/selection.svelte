<script>
  import { onMount, getContext, onDestroy, afterUpdate } from 'svelte'
  import { store } from 'Editor/store'
  import { selected, tool, activeArtboard } from 'Editor/store/ui'
  import { getters, setters } from 'Editor/store'
  import * as consts from 'Editor/scripts/consts'
  import * as utilities from 'Editor/scripts/utilities'

  let subscribers = []
  let root
  let inner
  let context = getContext('canvas')
  let showTransformControls = true
  let editingPoly = false
  let pointsContainer
  let selectedObjects = []
  let selectionRect = {}

  onMount(() => {
    redraw()
    createEvents()
  })
  onDestroy(() => {
    subscribers.forEach((unsub) => unsub())
    subscribers = []
    removeEvents()
  })
  afterUpdate(() => {
    if (!moving && !scaling) redraw()
  })
  subscribers.push(
    store.subscribe(() => {
      redraw()
    })
  )
  subscribers.push(
    activeArtboard.subscribe(() => {
      redraw()
    })
  )

  function createEvents() {
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)
    document.addEventListener(consts.EVENT_FORM_CONTROL_UPDATE_START, handleFormControlUpdateStart)
    document.addEventListener(consts.EVENT_FORM_CONTROL_UPDATE_END, handleFormControlUpdateEnd)
    document.addEventListener(consts.EVENT_CANVAS_ZOOM_END, handleCanvasZoom)
    document.addEventListener(consts.EVENT_OBJECT_QUICK_DRAG, handleQuickDrag)
  }
  function removeEvents() {
    document.removeEventListener('mousedown', handleMouseDown)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    document.removeEventListener('keydown', handleKeyDown)
    document.removeEventListener('keyup', handleKeyUp)
    document.removeEventListener(consts.EVENT_FORM_CONTROL_UPDATE_START, handleFormControlUpdateStart)
    document.removeEventListener(consts.EVENT_FORM_CONTROL_UPDATE_END, handleFormControlUpdateEnd)
    document.removeEventListener(consts.EVENT_CANVAS_ZOOM_END, handleCanvasZoom)
    document.removeEventListener(consts.EVENT_OBJECT_QUICK_DRAG, handleQuickDrag)
  }

  // Zoom handling
  function handleCanvasZoom() {
    redraw()
  }

  // Quick move handling
  function handleQuickDrag() {
    startMove()
  }

  // Fast redraw handling
  let formControlUpdating = false
  function handleFormControlUpdateStart() {
    formControlUpdating = true
    redraw()
  }
  function handleFormControlUpdateEnd() {
    formControlUpdating = false
  }

  // Draw selection
  function redraw() {
    if (!document.querySelector('#selection')) return

    flattenSelectedObjectHierarchy()
    showTransformControls = shouldShowTransformControls()
    editingPoly = shouldPlacePolyPoints()

    if (selectedObjects.length > 0 && $tool === consts.TOOL_SELECT && !formControlUpdating) {
      drawSelection()
    } else {
      hideSelection()
    }
  }
  function drawSelection() {
    selectionRect = utilities.calcBoundingRectForObjects(selectedObjects, context.getCanvasRect())
    if (!selectionRect) return

    root.style.setProperty('left', selectionRect.x + '%', 'important')
    root.style.setProperty('top', selectionRect.y + '%', 'important')
    root.style.width = selectionRect.width + '%'
    root.style.height = selectionRect.height + '%'
    root.style.display = 'block'

    if (editingPoly) {
      inner.style.margin = '-15px 0 0 -15px'
      inner.style.padding = '15px'
      deletePoints()
      drawPoints()
    } else {
      inner.style.margin = '0'
      inner.style.padding = '0'
      deletePoints()
    }

    if (movingPoint) {
      inner.style.display = 'none'
    } else {
      inner.style.display = 'block'
    }
  }
  function hideSelection() {
    root.style.display = 'none'
  }
  function shouldShowTransformControls() {
    for (let obj of selectedObjects) {
      if (obj.type !== consts.OBJECT_SPOT && obj.type !== consts.OBJECT_TEXT) {
        return true
      }
    }
    return false
  }
  function shouldPlacePolyPoints() {
    if (selectedObjects.length === 1 && selectedObjects[0].type === 'poly') return true
    return false
  }
  function flattenSelectedObjectHierarchy() {
    // If we are moving a point, don't update the hierarchy
    // because it will overwrite the object with the temporary props
    if (movingPoint) return

    selectedObjects = []

    for (let id of $selected) {
      if (getters.isObjectChildOfActiveArtboard(id)) {
        let obj = structuredClone(getters.getObject(id))
        if (obj.type === consts.OBJECT_GROUP) {
          selectedObjects.push(...getChildren(obj))
        } else {
          selectedObjects.push(obj)
        }
      }
    }

    return selectedObjects
  }
  function drawPoints() {
    let obj = selectedObjects[0]
    pointsContainer = document.createElement('div')

    for (let i = 0; i < obj.points.length; i++) {
      let el = document.createElement('div')
      el.style.setProperty('left', obj.points[i].x + '%', 'important')
      el.style.setProperty('top', obj.points[i].y + '%', 'important')
      el.classList.add('point')
      el.dataset.selectionControlType = 'point'
      el.dataset.pointIndex = i
      pointsContainer.appendChild(el)
    }

    root.appendChild(pointsContainer)
  }
  function deletePoints() {
    if (pointsContainer) pointsContainer.remove()
  }

  // Editing functionality
  let shiftDown = false
  let initialCoords = { x: 0, y: 0 }
  let coords = { x: 0, y: 0 }
  let transformStartEvent = new Event(consts.EVENT_OBJECT_TRANSFORM_START)
  let transformEndEvent = new Event(consts.EVENT_OBJECT_TRANSFORM_END)

  // Moving
  let moving = false
  let moveOffset = { x: 0, y: 0 }
  let moveOffsetPerObject = []
  let moveMultiplierPerObject = []
  let canMoveX = false
  let canMoveY = false
  let canMoveSelectionRectX = false
  let canMoveSelectionRectY = false
  let moveEvent = new Event(consts.EVENT_OBJECT_MOVE)

  // Scaling
  let scaleEvent = new Event(consts.EVENT_OBJECT_SCALE)
  let scaling = false
  let anchorPoint = { x: 0, y: 0 }
  let scaleFactor = { x: 1, y: 1 }
  let canScaleX = false
  let canScaleY = false
  let scaleControl = 1

  // Poly editing
  let editPolyEvent = new Event(consts.EVENT_OBJECT_EDIT_POLY)
  let draggedPointIndex = 0
  let movingPoint = false
  let tempPoints = []
  let draggedPointEl = undefined
  let tempPointEl = undefined
  let tempPointIndex = undefined
  let tempPoint = { x: 0, y: 0 }

  // Event handlers
  function handleMouseDown(e) {
    initialCoords = { x: e.pageX, y: e.pageY }
    coords = { x: e.pageX, y: e.pageY }

    if (e.button !== 0) return

    if (e.target.dataset.selectionControlType === 'move') {
      startMove()
    }
    if (e.target.dataset.selectionControlType === 'scale') {
      startScaling(e)
    }
    if (e.target.dataset.selectionControlType === 'point') {
      startMovingPoint(parseInt(e.target.dataset.pointIndex))
    }
    if (e.target.dataset.selectionControlType === 'temp-point') {
      insertPoint()
      hideTempPoint()
      startMovingPoint(parseInt(e.target.dataset.pointIndex))
    }
  }
  function handleMouseMove(e) {
    coords = { x: e.pageX, y: e.pageY }
    hideTempPoint()

    if (moving) {
      move()
      return
    }
    if (scaling) {
      scale()
      return
    }
    if (movingPoint) {
      movePoint()
      return
    }

    if (editingPoly && e.target.dataset.selectionControlType !== 'point') {
      drawTempPoint()
    }
  }
  function handleMouseUp() {
    if (moving) {
      endMove()
    }
    if (scaling) {
      endScaling()
    }
    if (movingPoint) {
      endMovingPoint()
    }
  }
  function handleKeyDown(e) {
    shiftDown = e.shiftKey
  }
  function handleKeyUp(e) {
    shiftDown = false
  }

  // Move
  function startMove() {
    moving = true
    moveOffset = { x: 0, y: 0 }
    document.dispatchEvent(transformStartEvent)
  }
  function move() {
    moveOffset = absToRel({
      x: coords.x - initialCoords.x,
      y: coords.y - initialCoords.y,
    })

    // Prevent going out of canvas
    for (let obj of selectedObjects) {
      let objWidth = obj.width
      let objHeight = obj.height

      if (obj.type === consts.OBJECT_SPOT || obj.type === consts.OBJECT_TEXT) {
        objWidth = 0
        objHeight = 0
      }

      if (obj.x + objWidth + moveOffset.x > 100) {
        moveOffset.x = 100 - (obj.x + objWidth)
      }
      if (obj.y + objHeight + moveOffset.y > 100) {
        moveOffset.y = 100 - (obj.y + objHeight)
      }
      if (obj.x + moveOffset.x < 0) {
        moveOffset.x = -obj.x
      }
      if (obj.y + moveOffset.y < 0) {
        moveOffset.y = -obj.y
      }
    }

    // Update selection position
    root.style.setProperty('left', selectionRect.x + moveOffset.x + '%', 'important')
    root.style.setProperty('top', selectionRect.y + moveOffset.y + '%', 'important')

    // Dispatch event
    moveEvent.detail = {
      move: moveOffset,
      ids: selectedObjects.map((obj) => obj.id),
    }

    document.dispatchEvent(moveEvent)
  }
  function endMove() {
    moving = false
    document.dispatchEvent(transformEndEvent)

    // Apply transform
    let values = {}
    for (let obj of selectedObjects) {
      values[obj.id] = {
        x: obj.x + moveOffset.x,
        y: obj.y + moveOffset.y,
      }
    }

    setters.setObjectValues(values)

    // Reset translation of the selection
    redraw()
  }

  // Scale
  function startScaling(e) {
    document.dispatchEvent(transformStartEvent)
    scaling = true
    scaleControl = parseInt(e.target.dataset.selectionScaleControl)
    scaleFactor = { x: 1, y: 1 }

    canScaleX = scaleControl === 1 || scaleControl === 3 || scaleControl === 4 || scaleControl === 5 || scaleControl === 7 || scaleControl === 8 ? true : false
    canScaleY = scaleControl === 1 || scaleControl === 2 || scaleControl === 3 || scaleControl === 5 || scaleControl === 6 || scaleControl === 7 ? true : false

    canMoveX = scaleControl === 1 || scaleControl === 3 || scaleControl === 4 || scaleControl === 5 || scaleControl === 7 || scaleControl === 8 ? true : false
    canMoveY = scaleControl === 1 || scaleControl === 2 || scaleControl === 3 || scaleControl === 5 || scaleControl === 6 || scaleControl === 7 ? true : false

    canMoveSelectionRectX = scaleControl === 1 || scaleControl === 7 || scaleControl === 8 ? true : false
    canMoveSelectionRectY = scaleControl === 1 || scaleControl === 2 || scaleControl === 3 ? true : false

    // Calculate anchor point

    anchorPoint = { x: 0, y: 0 }

    if (scaleControl === 1) {
      anchorPoint = {
        x: selectionRect.x + selectionRect.width,
        y: selectionRect.y + selectionRect.height,
      }
    }
    if (scaleControl === 2) {
      anchorPoint = {
        x: selectionRect.x + selectionRect.width / 2,
        y: selectionRect.y + selectionRect.height,
      }
    }
    if (scaleControl === 3) {
      anchorPoint = {
        x: selectionRect.x,
        y: selectionRect.y + selectionRect.height,
      }
    }
    if (scaleControl === 4) {
      anchorPoint = {
        x: selectionRect.x,
        y: selectionRect.y + selectionRect.height / 2,
      }
    }
    if (scaleControl === 5) {
      anchorPoint = {
        x: selectionRect.x,
        y: selectionRect.y,
      }
    }
    if (scaleControl === 6) {
      anchorPoint = {
        x: selectionRect.x + selectionRect.width / 2,
        y: selectionRect.y,
      }
    }
    if (scaleControl === 7) {
      anchorPoint = {
        x: selectionRect.x + selectionRect.width,
        y: selectionRect.y,
      }
    }
    if (scaleControl === 8) {
      anchorPoint = {
        x: selectionRect.x + selectionRect.width,
        y: selectionRect.y + selectionRect.height / 2,
      }
    }

    for (let obj of selectedObjects) {
      moveOffsetPerObject[obj.id] = { x: 0, y: 0 }
      moveMultiplierPerObject[obj.id] = { x: 1, y: 1 }

      let distanceFromAnchorX = selectionRect.width
      let distanceFromAnchorY = selectionRect.height

      if (scaleControl === 3 || scaleControl === 4 || scaleControl === 5) {
        distanceFromAnchorX = obj.x - anchorPoint.x
      }
      if (scaleControl === 1 || scaleControl === 7 || scaleControl === 8) {
        distanceFromAnchorX = anchorPoint.x - obj.x
      }

      if (scaleControl === 1 || scaleControl === 2 || scaleControl === 3) {
        distanceFromAnchorY = anchorPoint.y - obj.y
      }
      if (scaleControl === 5 || scaleControl === 6 || scaleControl === 7) {
        distanceFromAnchorY = obj.y - anchorPoint.y
      }

      moveMultiplierPerObject[obj.id] = {
        x: distanceFromAnchorX / selectionRect.width,
        y: distanceFromAnchorY / selectionRect.height,
      }
    }
  }
  function scale() {
    let mouseOffsetRel = absToRel({
      x: coords.x - initialCoords.x,
      y: coords.y - initialCoords.y,
    })

    // Virtual canvas size
    // The selection can't go outside those bounds
    let canvasBounds = {
      top: 0,
      bottom: 100,
      left: 0,
      right: 100,
    }

    // If SHIFT is pressed, lock ratio and shrink canvas bounds
    if (shiftDown && [1, 3, 5, 7].includes(scaleControl)) {
      let ratio = selectionRect.width / selectionRect.height

      if (scaleControl === 3 || scaleControl === 7) {
        mouseOffsetRel.y = -mouseOffsetRel.x / ratio
      } else {
        mouseOffsetRel.y = mouseOffsetRel.x / ratio
      }

      let maxWidth, maxHeight
      if (scaleControl === 1) {
        maxWidth = selectionRect.x + selectionRect.width
        maxHeight = selectionRect.y + selectionRect.height
      }

      if (scaleControl === 3) {
        maxWidth = 100 - selectionRect.x
        maxHeight = selectionRect.y + selectionRect.height
      }

      if (scaleControl === 5) {
        maxWidth = 100 - selectionRect.x
        maxHeight = 100 - selectionRect.y
      }

      if (scaleControl === 7) {
        maxWidth = selectionRect.x + selectionRect.width
        maxHeight = 100 - selectionRect.y
      }

      let maxScaleX = maxWidth / selectionRect.width
      let maxScaleY = maxHeight / selectionRect.height
      let maxScale = maxScaleX < maxScaleY ? maxScaleX : maxScaleY
      canvasBounds.left = selectionRect.x - (selectionRect.width * maxScale - selectionRect.width)
      canvasBounds.top = selectionRect.y - (selectionRect.height * maxScale - selectionRect.height)
      canvasBounds.right = selectionRect.x + selectionRect.width * maxScale
      canvasBounds.bottom = selectionRect.y + selectionRect.height * maxScale
    }

    // Limit mouse offset to canvas bounds
    if (canMoveSelectionRectX) {
      if (selectionRect.x + mouseOffsetRel.x < canvasBounds.left) mouseOffsetRel.x = canvasBounds.left - selectionRect.x
      if (mouseOffsetRel.x > selectionRect.width) mouseOffsetRel.x = selectionRect.width
    } else {
      if (selectionRect.x + selectionRect.width + mouseOffsetRel.x > canvasBounds.right) mouseOffsetRel.x = canvasBounds.right - (selectionRect.x + selectionRect.width)
      if (-mouseOffsetRel.x > selectionRect.width) mouseOffsetRel.x = -selectionRect.width
    }

    if (canMoveSelectionRectY) {
      if (selectionRect.y + mouseOffsetRel.y < canvasBounds.top) mouseOffsetRel.y = canvasBounds.top - selectionRect.y
      if (mouseOffsetRel.y > selectionRect.height) mouseOffsetRel.y = selectionRect.height
    } else {
      if (selectionRect.y + selectionRect.height + mouseOffsetRel.y > canvasBounds.bottom) mouseOffsetRel.y = canvasBounds.bottom - (selectionRect.y + selectionRect.height)
      if (-mouseOffsetRel.y > selectionRect.height) mouseOffsetRel.y = -selectionRect.height
    }

    // Calculate mouse offset, relative to anchor
    let anchoredMouseOffsetRel = {
      x: mouseOffsetRel.x,
      y: mouseOffsetRel.y,
    }
    if (scaleControl === 1 || scaleControl === 7 || scaleControl === 8) anchoredMouseOffsetRel.x *= -1
    if (scaleControl === 1 || scaleControl === 2 || scaleControl === 3) anchoredMouseOffsetRel.y *= -1

    // Calculate scale
    scaleFactor.x = canScaleX ? (selectionRect.width + anchoredMouseOffsetRel.x) / selectionRect.width : 1
    scaleFactor.y = canScaleY ? (selectionRect.height + anchoredMouseOffsetRel.y) / selectionRect.height : 1

    // Calculate move
    moveOffset.x = canMoveSelectionRectX ? mouseOffsetRel.x : 0
    moveOffset.y = canMoveSelectionRectY ? mouseOffsetRel.y : 0

    // Apply move to each object
    for (let obj of selectedObjects) {
      moveOffsetPerObject[obj.id] = { x: 0, y: 0 }

      if (canMoveX) {
        moveOffsetPerObject[obj.id].x = mouseOffsetRel.x * moveMultiplierPerObject[obj.id].x
      }
      if (canMoveY) {
        moveOffsetPerObject[obj.id].y = mouseOffsetRel.y * moveMultiplierPerObject[obj.id].y
      }
    }

    // Calculate the move of the whole selection
    let totalMove = { x: 0, y: 0 }
    if (scaleControl === 1 || scaleControl === 7 || scaleControl === 8) totalMove.x = mouseOffsetRel.x
    if (scaleControl === 1 || scaleControl === 2 || scaleControl === 3) totalMove.y = mouseOffsetRel.y

    // Update selection position and size
    root.style.width = selectionRect.width * scaleFactor.x + '%'
    root.style.height = selectionRect.height * scaleFactor.y + '%'
    root.style.setProperty('left', selectionRect.x + moveOffset.x + '%', 'important')
    root.style.setProperty('top', selectionRect.y + moveOffset.y + '%', 'important')

    // Dispatch event
    scaleEvent.detail = {
      movePerObject: moveOffsetPerObject,
      move: totalMove,
      scale: scaleFactor,
      ids: selectedObjects.map((obj) => obj.id),
    }
    document.dispatchEvent(scaleEvent)
  }
  function endScaling() {
    document.dispatchEvent(transformEndEvent)
    scaling = false

    // Apply transform
    let values = {}
    for (let obj of selectedObjects) {
      values[obj.id] = {
        x: obj.x + moveOffsetPerObject[obj.id].x,
        y: obj.y + moveOffsetPerObject[obj.id].y,
        width: obj.width * scaleFactor.x,
        height: obj.height * scaleFactor.y,
      }
    }

    setters.setObjectValues(values)

    // Reset translation of the selection
    redraw()
  }

  // Poly editing
  function startMovingPoint(index = 0) {
    let obj = selectedObjects[0]
    document.dispatchEvent(transformStartEvent)
    movingPoint = true
    draggedPointIndex = index

    // Modify the object
    // ---- Convert points from object to canvas space
    let newPoints = []
    for (let p of obj.points) {
      newPoints.push({
        x: obj.width * (p.x / 100) + obj.x,
        y: obj.height * (p.y / 100) + obj.y,
      })
    }

    // ---- Fit object to canvas
    obj.x = 0
    obj.y = 0
    obj.width = 100
    obj.height = 100
    obj.points = newPoints
    tempPoints = structuredClone(obj.points)

    // ---- Redraw the object
    editPolyEvent.detail = {
      id: obj.id,
      x: obj.x,
      y: obj.y,
      width: obj.width,
      height: obj.height,
      points: obj.points,
    }
    document.dispatchEvent(editPolyEvent)

    redraw()
  }
  function movePoint() {
    let obj = selectedObjects[0]

    moveOffset = absToRel({
      x: coords.x - initialCoords.x,
      y: coords.y - initialCoords.y,
    })

    // Calculate new coords for the point
    let dx = (moveOffset.x / obj.width) * 100
    let dy = (moveOffset.y / obj.height) * 100
    let x = obj.points[draggedPointIndex].x + dx
    let y = obj.points[draggedPointIndex].y + dy

    // Limit point to canvas
    x = x < 0 ? 0 : x
    x = x > 100 ? 100 : x
    y = y < 0 ? 0 : y
    y = y > 100 ? 100 : y

    // Update the points array
    tempPoints = []
    for (let i = 0; i < obj.points.length; i++) {
      if (i !== draggedPointIndex) {
        tempPoints.push({
          x: obj.points[i].x,
          y: obj.points[i].y,
        })
      } else {
        tempPoints.push({
          x,
          y,
        })
      }
    }

    // Update the point element position
    draggedPointEl = document.querySelector(`[data-selection-control-type="point"][data-point-index="${draggedPointIndex}"]`)
    draggedPointEl.style.setProperty('left', x + '%', 'important')
    draggedPointEl.style.setProperty('top', y + '%', 'important')

    // Send redraw event to the object
    editPolyEvent.detail = {
      id: obj.id,
      x: obj.x,
      y: obj.y,
      width: obj.width,
      height: obj.height,
      points: tempPoints,
    }
    document.dispatchEvent(editPolyEvent)
  }
  function endMovingPoint() {
    let obj = selectedObjects[0]
    document.dispatchEvent(transformEndEvent)
    movingPoint = false

    // Recalc new width/height and point coords
    let minX = 9999
    let minY = 9999
    let maxX = 0
    let maxY = 0
    let x,
      y,
      width,
      height,
      points = []

    // ---- Find bounds of the object
    for (let p of tempPoints) {
      if (p.x < minX) minX = p.x
      if (p.y < minY) minY = p.y
      if (p.x > maxX) maxX = p.x
      if (p.y > maxY) maxY = p.y
    }

    // ---- Calc width/height/x/y
    x = minX
    y = minY
    width = maxX - minX
    height = maxY - minY

    // ---- Convert point coords from canvas to object space
    for (let p of tempPoints) {
      points.push({
        x: ((p.x - x) / width) * 100,
        y: ((p.y - y) / height) * 100,
      })
    }

    // Write to store
    let ids = [obj.id]
    let values = {}
    values[ids[0]] = {
      x,
      y,
      width,
      height,
      points,
    }

    setters.setObjectValues(values)
    redraw()
  }
  function drawTempPoint() {
    let obj = selectedObjects[0]
    tempPointIndex = undefined

    // Mouse coords in % relative to canvas
    let p = {
      x: ((coords.x - context.getCanvasRect().left) / context.getCanvasRect().width) * 100,
      y: ((coords.y - context.getCanvasRect().top) / context.getCanvasRect().height) * 100,
    }

    // Mouse coords in % relative to object
    p = {
      x: ((p.x - obj.x) / obj.width) * 100,
      y: ((p.y - obj.y) / obj.height) * 100,
    }

    let shortestDistance = 9999
    let minDistance = (20 / context.getCanvasRect().width) * 100

    // Find the closest point to each line
    // and take the shortest path
    for (let i = 0; i < obj.points.length; i++) {
      let a = { x: obj.points[i].x, y: obj.points[i].y }
      let b = undefined

      if (obj.points[i + 1]) {
        b = { x: obj.points[i + 1].x, y: obj.points[i + 1].y }
      } else {
        b = { x: obj.points[0].x, y: obj.points[0].y }
      }

      let closestPointToLine = new utilities.Vector2(p.x, p.y).closestPointOnLine(new utilities.Vector2(a.x, a.y), new utilities.Vector2(b.x, b.y))
      let d = Math.sqrt(Math.pow(p.x - closestPointToLine.x, 2) + Math.pow(p.y - closestPointToLine.y, 2))

      if (d < shortestDistance && d < minDistance) {
        self.tempControlPointIndex = i
        shortestDistance = d
        tempPointIndex = i
        tempPoint = { x: closestPointToLine.x, y: closestPointToLine.y }
      }
    }

    // Draw temp point
    if (tempPointIndex !== undefined) {
      tempPointEl.style.display = 'block'
      tempPointEl.style.setProperty('left', tempPoint.x + '%', 'important')
      tempPointEl.style.setProperty('top', tempPoint.y + '%', 'important')

      tempPointEl.dataset.pointIndex = tempPointIndex + 1
    } else {
      if (tempPointEl.style.display !== 'none') tempPointEl.style.display = 'none'
    }
  }
  function hideTempPoint() {
    if (tempPointEl.style.display !== 'none') tempPointEl.style.display = 'none'
  }
  function insertPoint() {
    if (tempPointIndex !== undefined) {
      let obj = selectedObjects[0]
      let ids = [obj.id]
      let values = {}
      let points = structuredClone(obj.points)
      points.splice(tempPointIndex + 1, 0, { ...tempPoint })

      values[obj.id] = { points }

      setters.setObjectValues(values)
      redraw()
    }
  }

  // Utility
  function absToRel(coord) {
    return {
      x: (coord.x / context.getCanvasRect().width) * 100,
      y: (coord.y / context.getCanvasRect().height) * 100,
    }
  }
  function getChildren(obj) {
    let result = []

    for (let child of obj.children) {
      if (child.type === consts.OBJECT_GROUP || child.type === consts.OBJECT_ARTBOARD) {
        result.push(...getChildren(child))
      } else {
        result.push(child)
      }
    }

    return result
  }
</script>

<div id="selection" bind:this={root} style="z-index: 9998;" class="absolute left-0 top-0 cursor-move">
  <div bind:this={inner} class="absolute w-full h-full box-content" style="padding: 20px; margin: -20px 0 0 -20px;">
    {#if showTransformControls}
      <div data-selection-control-type="scale" data-selection-scale-control="1" class="select-control select-control-top-left" />
      <div data-selection-control-type="scale" data-selection-scale-control="2" class="select-control select-control-top" />
      <div data-selection-control-type="scale" data-selection-scale-control="3" class="select-control select-control-top-right" />
      <div data-selection-control-type="scale" data-selection-scale-control="4" class="select-control select-control-right" />
      <div data-selection-control-type="scale" data-selection-scale-control="5" class="select-control select-control-bottom-right" />
      <div data-selection-control-type="scale" data-selection-scale-control="6" class="select-control select-control-bottom" />
      <div data-selection-control-type="scale" data-selection-scale-control="7" class="select-control select-control-bottom-left" />
      <div data-selection-control-type="scale" data-selection-scale-control="8" class="select-control select-control-left" />
    {/if}
    <div data-selection-control-type="move" class="z-0 absolute left-0 top-0 w-full h-full border border-black" />
    <div data-selection-control-type="move" class="z-0 absolute left-0 top-0 w-full h-full border border-dashed border-white" style="stroke-dasharray: 10, 10" />
  </div>
  <div bind:this={tempPointEl} data-selection-control-type="temp-point" class="point temporary-point" style="display: none;" />
</div>

<style>
  .select-control {
    position: absolute;
    z-index: 1;
    width: 10px;
    height: 10px;
    margin-left: -5px;
    margin-top: -5px;
    background: black;
    border: 1px solid white;
    border-radius: 2px;
  }
  .select-control-top-left {
    left: 0;
    top: 0;
    cursor: nwse-resize;
  }
  .select-control-top {
    left: 50%;
    top: 0;
    cursor: ns-resize;
  }
  .select-control-top-right {
    left: 100%;
    top: 0;
    cursor: nesw-resize;
  }
  .select-control-right {
    left: 100%;
    top: 50%;
    cursor: ew-resize;
  }
  .select-control-bottom-right {
    left: 100%;
    top: 100%;
    cursor: nwse-resize;
  }
  .select-control-bottom {
    left: 50%;
    top: 100%;
    cursor: ns-resize;
  }
  .select-control-bottom-left {
    left: 0;
    top: 100%;
    cursor: nesw-resize;
  }
  .select-control-left {
    left: 0;
    top: 50%;
    cursor: ew-resize;
  }
</style>
