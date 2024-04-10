<script>
  import { onMount, onDestroy, afterUpdate, setContext } from 'svelte'
  import { store, getters, setters } from 'Editor/store'
  import {
    selected,
    tool,
    zoom,
    minZoom,
    maxZoom,
    activeArtboard,
    objectListVisible,
    objectSettingsVisible,
    mapSettingsVisible,
  } from 'Editor/store/ui'
  import * as utilities from 'Editor/scripts/utilities'
  import * as consts from 'Editor/scripts/consts'
  import Object from 'Editor/components/canvas/objects/object'
  import Selection from 'Editor/components/canvas/selection'
  import Highlight from 'Editor/components/canvas/highlight'
  import Tooltip from 'Editor/components/canvas/tooltip/tooltip'
  import ArtboardMenu from 'Editor/components/artboard-menu'
  import Background from 'Editor/components/canvas/background'

  let subscribers = []
  let root
  let artboards = getters.getArtboards()

  subscribers.push(
    store.subscribe(() => {
      artboards = getters.getArtboards()
      canvasSize = calcDefaultCanvasSize()
      updateCanvasPosition()
    })
  )

  onMount(() => {
    canvasSize = calcDefaultCanvasSize()
    updateCanvasPosition()
    createEvents()
  })

  afterUpdate(() => {
    canvasBoundingRect = undefined

    if (getters.getValue({ group: 'custom_code', prop: 'preview_custom_css' }) === true) {
      const customCSS = getters.getValue({ group: 'custom_code', prop: 'custom_css' })

      if (!document.querySelector('#custom-css-preview')) {
        let style = document.createElement('style')
        style.id = 'custom-css-preview'
        style.innerHTML = customCSS
        document.head.appendChild(style)
      } else {
        document.querySelector('#custom-css-preview').innerHTML = customCSS
      }
    } else {
      if (document.querySelector('#custom-css-preview')) {
        document.querySelector('#custom-css-preview').remove()
      }
    }
  })

  onDestroy(() => {
    subscribers.forEach((unsub) => unsub())
    subscribers = []
    removeEvents()
  })

  setContext('canvas', {
    getCanvasRect: (force) => {
      if (force) {
        let rect = root.getBoundingClientRect()
        return {
          width: rect.width,
          height: rect.height,
          left: rect.x,
          top: rect.y,
        }
      } else {
        return {
          width: getCanvasBoundingRect().width,
          height: getCanvasBoundingRect().height,
          left: getCanvasBoundingRect().x,
          top: getCanvasBoundingRect().y,
        }
      }
    },
    select: (id) => {
      if ($tool !== consts.TOOL_SELECT) return
      if (shiftDown || ctrlDown) {
        if (!$selected.includes(id)) setters.setSelection([...$selected, id])
        setters.setSelection($selected)
      } else {
        setters.setSelection([id])
      }
    },
  })

  let canvasBoundingRect
  let cursor = 'default'
  $: cursor = $tool !== consts.TOOL_SELECT ? 'crosshair' : 'default'
  let coords = { x: 0, y: 0 }
  let coordsInitial = { x: 0, y: 0 }
  let coordsCanvas = { x: 0, y: 0 }
  let coordsCanvasInitial = { x: 0, y: 0 }
  let coordsCanvasLimited = { x: 0, y: 0 }
  let eventStartedInCanvas = false
  let mouseIsInCanvas = false

  // Zoom, drag
  let canvasRect = { x: 0, y: 0, width: 0, height: 0 }
  let canvasSize = { width: 0, height: 0 }
  let initialOffset = { x: 0, y: 0 }
  let targetOffset = { x: 0, y: 0 }
  let initialZoom
  let startTime
  let zoomMultiplier = 2
  let dragging = false
  let dragCursor = ''
  let toolBeforeTempDrag = $tool
  let zoomEndTimeout
  let quickPanMode = false

  // Spot drawing
  let didStartDrawingSpot

  // Rect drawing
  let didStartDrawingRect
  let tempRect
  let tempRectX, tempRectY, tempRectWidth, tempRectHeight

  // Oval drawing
  let didStartDrawingOval
  let tempOval
  let tempOvalX, tempOvalY, tempOvalWidth, tempOvalHeight

  // Poly drawing
  let didStartDrawingPoly
  let didStartPlacingPolyPoint
  let polyCoords = []
  let tempPolySVG

  // Text drawing
  let didStartDrawingText

  // Selecting
  let shiftDown = false
  let ctrlDown = false
  let shouldDeselect = false

  // Misc
  let tooltip

  $: {
    switch ($tool) {
      case consts.TOOL_ZOOM_IN:
        cursor = 'zoom-in'
        break
      case consts.TOOL_ZOOM_OUT:
        cursor = 'zoom-out'
        break
      case consts.TOOL_SPOT:
      case consts.TOOL_RECT:
      case consts.TOOL_OVAL:
      case consts.TOOL_POLY:
      case consts.TOOL_TEXT:
        cursor = 'crosshair'
        break
      case consts.TOOL_DRAG:
        cursor = 'grab'
        break
      default:
        cursor = 'default'
    }

    if (dragCursor) cursor = 'grab'
  }

  subscribers.push(
    tool.subscribe(() => {
      if (
        $tool === consts.TOOL_SPOT ||
        $tool === consts.TOOL_RECT ||
        $tool === consts.TOOL_OVAL ||
        $tool === consts.TOOL_POLY ||
        $tool === consts.TOOL_TEXT
      )
        setters.setSelection([])
      if (didStartDrawingPoly && !quickPanMode) endDrawingPoly()
    })
  )

  subscribers.push(
    activeArtboard.subscribe(() => {
      canvasSize = calcDefaultCanvasSize()
      updateCanvasPosition()
    })
  )
  subscribers.push(
    objectListVisible.subscribe(() => {
      setTimeout(() => {
        canvasSize = calcDefaultCanvasSize()
        updateCanvasPosition()
      }, 200)
    })
  )
  subscribers.push(
    objectSettingsVisible.subscribe(() => {
      setTimeout(() => {
        canvasSize = calcDefaultCanvasSize()
        updateCanvasPosition()
      }, 200)
    })
  )
  subscribers.push(
    mapSettingsVisible.subscribe(() => {
      setTimeout(() => {
        canvasSize = calcDefaultCanvasSize()
        updateCanvasPosition()
      }, 200)
    })
  )

  function createEvents() {
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)
    window.addEventListener('resize', handleWindowResize)
    document.addEventListener(consts.EVENT_CANVAS_RESET, handleCanvasReset)
    document.addEventListener(consts.EVENT_CONTEXT_ZOOM_IN, handleCanvasZoomIn)
    document.addEventListener(consts.EVENT_CONTEXT_ZOOM_OUT, handleCanvasZoomOut)
    document.addEventListener(consts.SHORTCUT_ZOOM_RESET, handleCanvasReset)
    document.addEventListener(consts.SHORTCUT_ZOOM_IN, handleShortcutZoomIn)
    document.addEventListener(consts.SHORTCUT_ZOOM_OUT, handleShortcutZoomOut)
    document.addEventListener(consts.SHORTCUT_WHEEL_ZOOM_IN, handleShortcutWheelZoomIn)
    document.addEventListener(consts.SHORTCUT_WHEEL_ZOOM_OUT, handleShortcutWheelZoomOut)
    document.addEventListener(consts.SHORTCUT_PAN_START, handleShortcutPanStart)
    document.addEventListener(consts.SHORTCUT_PAN_END, handleShortcutPanEnd)
  }
  function removeEvents() {
    document.removeEventListener('mousedown', handleMouseDown)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('keydown', handleKeyDown)
    document.removeEventListener('mouseup', handleMouseUp)
    window.removeEventListener('resize', handleWindowResize)
    document.removeEventListener(consts.EVENT_CANVAS_RESET, handleCanvasReset)
    document.removeEventListener(consts.EVENT_CONTEXT_ZOOM_IN, handleCanvasZoomIn)
    document.removeEventListener(consts.EVENT_CONTEXT_ZOOM_OUT, handleCanvasZoomOut)
    document.removeEventListener(consts.SHORTCUT_ZOOM_RESET, handleCanvasReset)
    document.removeEventListener(consts.SHORTCUT_ZOOM_IN, handleShortcutZoomIn)
    document.removeEventListener(consts.SHORTCUT_ZOOM_OUT, handleShortcutZoomOut)
    document.removeEventListener(consts.SHORTCUT_WHEEL_ZOOM_IN, handleShortcutWheelZoomIn)
    document.removeEventListener(consts.SHORTCUT_WHEEL_ZOOM_OUT, handleShortcutWheelZoomOut)
    document.removeEventListener(consts.SHORTCUT_PAN_START, handleShortcutPanStart)
    document.removeEventListener(consts.SHORTCUT_PAN_END, handleShortcutPanEnd)
  }
  function handleMouseDown(e) {
    coordsInitial = { x: e.pageX, y: e.pageY }
    coordsCanvasInitial = screenToCanvas({ x: e.pageX, y: e.pageY })
    if (e.button !== 0) return

    if (
      areCoordsInsideCanvas(coordsCanvasInitial) &&
      e.target.closest(`[data-object-type="${consts.CANVAS_OBJECT_ROOT}"]`)
    ) {
      eventStartedInCanvas = true
    }

    if (shouldDeselectOnMouseUp(e)) shouldDeselect = true
    if (shouldStartDragging()) startDragging()
    if (shouldStartDrawingSpot()) startDrawingSpot()
    if (shouldStartDrawingText()) startDrawingText()

    if (shouldStartDrawingPoly()) startDrawingPoly()
    if (shouldPlacePolyPoint(e)) startPlacingPolyPoint()
  }
  function handleMouseMove(e) {
    coords = { x: e.pageX, y: e.pageY }
    coordsCanvas = screenToCanvas(coords)
    coordsCanvasLimited = limitToCanvas(coordsCanvas)

    if (e.button !== 0) return

    if (areCoordsInsideCanvas(coordsCanvas) && e.target.closest(`[data-object-type="${consts.CANVAS_OBJECT_ROOT}"]`)) {
      mouseIsInCanvas = true
    } else {
      mouseIsInCanvas = false
    }

    if (dragging) drag()
    if (shouldStartDrawingRect()) drawRect()
    if (shouldStartDrawingOval()) drawOval()
    if (didStartPlacingPolyPoint) updateLastPolyPointPosition()
    if (didStartDrawingPoly) redrawTempPolyTooltip(e)
  }
  function handleMouseUp(e) {
    coords = { x: e.pageX, y: e.pageY }

    if (e.button !== 0) return

    if (dragging) endDragging()
    if (didStartDrawingSpot) endDrawingSpot()
    if (didStartDrawingRect) endDrawingRect()
    if (didStartDrawingOval) endDrawingOval()

    if (didStartPlacingPolyPoint) didStartPlacingPolyPoint = false
    if (shouldEndDrawingPoly(e)) endDrawingPoly()

    if (didStartDrawingText) endDrawingText()
    if (shouldDeselect) setters.setSelection([])
    if (shouldZoomIn()) zoomIn({ ...coords })
    if (shouldZoomOut()) zoomOut({ ...coords })

    // Reset flags
    eventStartedInCanvas = false
    shouldDeselect = false
  }
  function handleKeyDown(e) {
    shiftDown = e.shiftKey
    ctrlDown = e.ctrlKey || e.metaKey
  }
  function handleKeyUp(e) {
    if (e.code === 'Escape') {
      if (didStartDrawingPoly) cancelDrawingPoly()
    }
    if (e.code === 'Enter') {
      if (didStartDrawingPoly) endDrawingPoly()
    }

    shiftDown = false
    ctrlDown = false
  }
  function handleCanvasZoomIn(e) {
    zoomIn({ ...e.detail })
  }
  function handleCanvasZoomOut(e) {
    zoomOut({ ...e.detail })
  }
  function handleShortcutZoomIn() {
    let canvasBgRect = document.querySelector(`[data-object-type="${consts.MAIN_ROOT}"]`)?.getBoundingClientRect()

    let x = canvasBgRect.x + canvasBgRect.width / 2
    let y = canvasBgRect.y + canvasBgRect.height / 2

    if ($selected.length > 0) {
      let canvasRect = root.getBoundingClientRect()
      let selectedObjects = []
      $selected.forEach((o) => selectedObjects.push(getters.getObject(o)))

      let objectsRect = utilities.calcBoundingRectForObjects(selectedObjects, canvasRect)
      objectsRect.x = (objectsRect.x / 100) * canvasRect.width
      objectsRect.y = (objectsRect.y / 100) * canvasRect.height
      objectsRect.width = (objectsRect.width / 100) * canvasRect.width
      objectsRect.height = (objectsRect.height / 100) * canvasRect.height

      x = canvasRect.x + objectsRect.x + objectsRect.width / 2
      y = canvasRect.y + objectsRect.y + objectsRect.height / 2
    }

    zoomIn({
      x,
      y,
    })
  }
  function handleShortcutZoomOut() {
    let canvasBgRect = document.querySelector(`[data-object-type="${consts.MAIN_ROOT}"]`)?.getBoundingClientRect()

    let x = canvasBgRect.x + canvasBgRect.width / 2
    let y = canvasBgRect.y + canvasBgRect.height / 2

    if ($selected.length > 0) {
      let canvasRect = root.getBoundingClientRect()
      let selectedObjects = []
      $selected.forEach((o) => selectedObjects.push(getters.getObject(o)))

      let objectsRect = utilities.calcBoundingRectForObjects(selectedObjects, canvasRect)
      objectsRect.x = (objectsRect.x / 100) * canvasRect.width
      objectsRect.y = (objectsRect.y / 100) * canvasRect.height
      objectsRect.width = (objectsRect.width / 100) * canvasRect.width
      objectsRect.height = (objectsRect.height / 100) * canvasRect.height

      x = canvasRect.x + objectsRect.x + objectsRect.width / 2
      y = canvasRect.y + objectsRect.y + objectsRect.height / 2
    }

    zoomOut({
      x,
      y,
    })
  }
  function handleShortcutWheelZoomIn() {
    zoomIn({
      x: coords.x,
      y: coords.y,
    })
  }
  function handleShortcutWheelZoomOut() {
    zoomOut({
      x: coords.x,
      y: coords.y,
    })
  }
  function handleShortcutPanStart() {
    if ($tool !== consts.TOOL_DRAG) {
      quickPanMode = true
      toolBeforeTempDrag = $tool
      $tool = consts.TOOL_DRAG
    }
  }
  function handleShortcutPanEnd() {
    $tool = toolBeforeTempDrag
    quickPanMode = false
  }
  function handleWindowResize() {
    canvasSize = calcDefaultCanvasSize()
    updateCanvasPosition()
  }

  // Zoom, drag
  function shouldStartDragging() {
    if ($tool === consts.TOOL_DRAG && eventStartedInCanvas) return true
    return false
  }
  function startDragging() {
    dragging = true
    initialOffset = { x: canvasRect.x, y: canvasRect.y }
  }
  function drag() {
    let dx = coords.x - coordsInitial.x
    let dy = coords.y - coordsInitial.y

    targetOffset = {
      x: initialOffset.x + dx,
      y: initialOffset.y + dy,
    }

    let event = new Event(consts.EVENT_CANVAS_DRAG)
    document.dispatchEvent(event)

    updateCanvasPosition()
  }
  function endDragging() {
    dragging = false
  }
  function shouldZoomIn() {
    if (eventStartedInCanvas && $tool === consts.TOOL_ZOOM_IN) return true
    return false
  }
  function zoomIn({ x, y }) {
    initialZoom = $zoom
    initialOffset = { x: canvasRect.x, y: canvasRect.y }

    if ($zoom >= $maxZoom) return

    $zoom *= zoomMultiplier
    $zoom = $zoom > $maxZoom ? $maxZoom : $zoom

    let eventCoords = { x, y }

    // Everything is in pixels, relative to canvas
    let focalPoint = {
      x: eventCoords.x - getCanvasBoundingRect().x,
      y: eventCoords.y - getCanvasBoundingRect().y,
    }

    let distanceFromFocalPointToCanvasCenter = {
      x: getCanvasBoundingRect().width / 2 - focalPoint.x,
      y: getCanvasBoundingRect().height / 2 - focalPoint.y,
    }

    targetOffset = {
      x: initialOffset.x + distanceFromFocalPointToCanvasCenter.x * (zoomMultiplier - 1),
      y: initialOffset.y + distanceFromFocalPointToCanvasCenter.y * (zoomMultiplier - 1),
    }

    updateCanvasPosition(true)
    canvasBoundingRect = undefined

    let event = new Event(consts.EVENT_CANVAS_ZOOM_START)
    document.dispatchEvent(event)

    clearTimeout(zoomEndTimeout)
    zoomEndTimeout = setTimeout(() => {
      let event = new Event(consts.EVENT_CANVAS_ZOOM_END)
      document.dispatchEvent(event)
      if (didStartDrawingPoly) redrawTempPoly(polyCoords)
    }, 200)
  }
  function shouldZoomOut() {
    if (eventStartedInCanvas && $tool === consts.TOOL_ZOOM_OUT) return true
    return false
  }
  function zoomOut({ x, y }) {
    initialZoom = $zoom
    initialOffset = { x: canvasRect.x, y: canvasRect.y }

    if ($zoom <= $minZoom) {
      targetOffset = { x: 0, y: 0 }
      updateCanvasPosition(true)
      canvasBoundingRect = undefined
      return
    }

    $zoom /= zoomMultiplier
    $zoom = $zoom < $minZoom ? $minZoom : $zoom

    let eventCoords = { x, y }

    // Everything is in pixels, relative to canvas
    let focalPoint = {
      x: eventCoords.x - getCanvasBoundingRect().x,
      y: eventCoords.y - getCanvasBoundingRect().y,
    }

    let distanceFromFocalPointToCanvasCenter = {
      x: getCanvasBoundingRect().width / 2 - focalPoint.x,
      y: getCanvasBoundingRect().height / 2 - focalPoint.y,
    }

    targetOffset = {
      x:
        canvasRect.x -
        (distanceFromFocalPointToCanvasCenter.x - distanceFromFocalPointToCanvasCenter.x / zoomMultiplier),
      y:
        canvasRect.y -
        (distanceFromFocalPointToCanvasCenter.y - distanceFromFocalPointToCanvasCenter.y / zoomMultiplier),
    }

    if ($zoom === 1) targetOffset = { x: 0, y: 0 }

    updateCanvasPosition(true)
    canvasBoundingRect = undefined

    let event = new Event(consts.EVENT_CANVAS_ZOOM_START)
    document.dispatchEvent(event)

    clearTimeout(zoomEndTimeout)
    zoomEndTimeout = setTimeout(() => {
      let event = new Event(consts.EVENT_CANVAS_ZOOM_END)
      document.dispatchEvent(event)
      if (didStartDrawingPoly) redrawTempPoly(polyCoords)
    }, 200)
  }
  function handleCanvasReset() {
    initialOffset = { x: canvasRect.x, y: canvasRect.y }
    targetOffset = { x: 0, y: 0 }
    initialZoom = $zoom
    $zoom = 1
    canvasBoundingRect = undefined
    updateCanvasPosition(true)

    let event = new Event(consts.EVENT_CANVAS_ZOOM_START)
    document.dispatchEvent(event)

    setTimeout(() => {
      let event = new Event(consts.EVENT_CANVAS_ZOOM_END)
      document.dispatchEvent(event)
    }, 200)
  }
  function updateCanvasPosition(animate) {
    if (animate) {
      startTime = Date.now()
      tick()
    } else {
      canvasRect.x = targetOffset.x
      canvasRect.y = targetOffset.y
      canvasRect.width = canvasSize.width * $zoom
      canvasRect.height = canvasSize.height * $zoom
    }
  }
  function tick() {
    const elapsed = Date.now() - startTime
    const duration = 150

    canvasRect.x = utilities.easeInOutCubic(elapsed, initialOffset.x, targetOffset.x - initialOffset.x, duration)
    canvasRect.y = utilities.easeInOutCubic(elapsed, initialOffset.y, targetOffset.y - initialOffset.y, duration)
    canvasRect.width = utilities.easeInOutCubic(
      elapsed,
      canvasSize.width * initialZoom,
      canvasSize.width * $zoom - canvasSize.width * initialZoom,
      duration
    )
    canvasRect.height = utilities.easeInOutCubic(
      elapsed,
      canvasSize.height * initialZoom,
      canvasSize.height * $zoom - canvasSize.height * initialZoom,
      duration
    )

    if (elapsed < duration) requestAnimationFrame(tick)
  }

  // Deselect
  function shouldDeselectOnMouseUp(e) {
    if ($tool !== consts.TOOL_SELECT) return false
    if (e.target.dataset.objectType === consts.CANVAS_OBJECT_ROOT) return true
    if (e.target.dataset.objectType === consts.MAIN_ROOT) return true
    if (e.target.dataset.objectType === consts.CANVAS_BACKGROUND) return true
  }

  // Draw Spot
  function shouldStartDrawingSpot() {
    if (
      eventStartedInCanvas &&
      $tool === consts.TOOL_SPOT &&
      areCoordsInsideCanvas(coordsCanvas) &&
      !didStartDrawingPoly
    )
      return true
    return false
  }
  function startDrawingSpot() {
    didStartDrawingSpot = true
  }
  function endDrawingSpot() {
    let id = setters.createSpot({ x: coordsCanvas.x, y: coordsCanvas.y })

    didStartDrawingSpot = false
    selected.set([id])
    $tool = consts.TOOL_SELECT
  }

  // Draw Rect
  function shouldStartDrawingRect() {
    if (
      eventStartedInCanvas &&
      $tool === consts.TOOL_RECT &&
      (Math.abs(coords.x - coordsInitial.x) > 3 || Math.abs(coords.y - coordsInitial.y) > 3) &&
      !didStartDrawingPoly
    )
      return true
    return false
  }
  function drawRect() {
    didStartDrawingRect = true

    let dx = coordsCanvasLimited.x - coordsCanvasInitial.x
    let dy = coordsCanvasLimited.y - coordsCanvasInitial.y

    tempRectX = dx >= 0 ? coordsCanvasInitial.x : coordsCanvasInitial.x - Math.abs(dx)
    tempRectY = dy >= 0 ? coordsCanvasInitial.y : coordsCanvasInitial.y - Math.abs(dy)
    tempRectWidth = Math.abs(dx)
    tempRectHeight = Math.abs(dy)

    drawTempRect({
      x: tempRectX,
      y: tempRectY,
      width: tempRectWidth,
      height: tempRectHeight,
    })

    let displayedWidth = (tempRectWidth / 100) * getCanvasBoundingRect().width
    let displayedHeight = (tempRectHeight / 100) * getCanvasBoundingRect().height

    drawTooltipAtMouse(`${Math.round(displayedWidth)} x ${Math.round(displayedHeight)}`)
  }
  function drawTempRect({ x, y, width, height }) {
    if (!tempRect) {
      tempRect = document.createElement('div')
      tempRect.classList.add('bg-primary-500')
      tempRect.classList.add('border-2')
      tempRect.classList.add('border-primary-500')
      tempRect.classList.add('bg-opacity-20')
      tempRect.classList.add('absolute')
      tempRect.classList.add('z-50')
    }

    root.appendChild(tempRect)

    tempRect.style.left = x + '%'
    tempRect.style.top = y + '%'
    tempRect.style.width = width + '%'
    tempRect.style.height = height + '%'
  }
  function removeTempRect() {
    tempRect?.remove()
  }
  function endDrawingRect() {
    let id = setters.createRect({
      x: tempRectX,
      y: tempRectY,
      width: tempRectWidth,
      height: tempRectHeight,
    })

    removeTempRect()
    hideTooltipAtMouse()
    didStartDrawingRect = false
    setters.setSelection([id])
    $tool = consts.TOOL_SELECT
  }

  // Draw Oval
  function shouldStartDrawingOval() {
    if (
      eventStartedInCanvas &&
      $tool === consts.TOOL_OVAL &&
      (Math.abs(coords.x - coordsInitial.x) > 3 || Math.abs(coords.y - coordsInitial.y) > 3) &&
      !didStartDrawingPoly
    )
      return true
    return false
  }
  function drawOval() {
    didStartDrawingOval = true

    const dx = coordsCanvasLimited.x - coordsCanvasInitial.x
    const dy = coordsCanvasLimited.y - coordsCanvasInitial.y

    tempOvalX = dx >= 0 ? coordsCanvasInitial.x : coordsCanvasInitial.x - Math.abs(dx)
    tempOvalY = dy >= 0 ? coordsCanvasInitial.y : coordsCanvasInitial.y - Math.abs(dy)
    tempOvalWidth = Math.abs(dx)
    tempOvalHeight = Math.abs(dy)

    drawTempOval({
      x: tempOvalX,
      y: tempOvalY,
      width: tempOvalWidth,
      height: tempOvalHeight,
    })

    let displayedWidth = Math.abs(coords.x - coordsInitial.x)
    let displayedHeight = Math.abs(coords.y - coordsInitial.y)
    drawTooltipAtMouse(`${Math.round(displayedWidth)} x ${Math.round(displayedHeight)}`)
  }
  function drawTempOval({ x, y, width, height }) {
    if (!tempOval) {
      tempOval = document.createElement('div')
      tempOval.classList.add('bg-primary-500')
      tempOval.classList.add('border-2')
      tempOval.classList.add('border-primary-500')
      tempOval.classList.add('bg-opacity-20')
      tempOval.classList.add('absolute')
      tempOval.classList.add('z-50')
    }

    root.appendChild(tempOval)

    tempOval.style.left = x + '%'
    tempOval.style.top = y + '%'
    tempOval.style.width = width + '%'
    tempOval.style.height = height + '%'
    tempOval.style.borderRadius = '50% 50%'
  }
  function removeTempOval() {
    tempOval?.remove()
  }
  function endDrawingOval() {
    let id = setters.createOval({
      x: tempOvalX,
      y: tempOvalY,
      width: tempOvalWidth,
      height: tempOvalHeight,
    })

    removeTempOval()
    hideTooltipAtMouse()
    didStartDrawingOval = false

    setters.setSelection([id])
    $tool = consts.TOOL_SELECT
  }

  // Draw Poly
  function shouldStartDrawingPoly() {
    if (!didStartDrawingPoly && $tool === consts.TOOL_POLY && eventStartedInCanvas) return true
    return false
  }
  function startDrawingPoly() {
    didStartDrawingPoly = true
    setters.setSelection([])
  }
  function shouldPlacePolyPoint(e) {
    if (
      didStartDrawingPoly &&
      eventStartedInCanvas &&
      e.target.dataset.objectType !== consts.CANVAS_OBJECT_FIRST_POLY_POINT &&
      $tool === consts.TOOL_POLY
    )
      return true
    return false
  }
  function startPlacingPolyPoint() {
    if (!areCoordsInsideCanvas(coordsCanvas)) return

    didStartPlacingPolyPoint = true

    polyCoords.push({
      x: (coords.x - getCanvasBoundingRect().x) / $zoom,
      y: (coords.y - getCanvasBoundingRect().y) / $zoom,
    })

    redrawTempPoly(polyCoords)
  }
  function updateLastPolyPointPosition() {
    polyCoords[polyCoords.length - 1] = {
      x: (coords.x - getCanvasBoundingRect().x) / $zoom,
      y: (coords.y - getCanvasBoundingRect().y) / $zoom,
    }

    redrawTempPoly(polyCoords)
  }
  function redrawTempPoly(_coords) {
    if (!tempPolySVG) {
      tempPolySVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      tempPolySVG.classList.add('absolute')
      tempPolySVG.classList.add('left-0')
      tempPolySVG.classList.add('top-0')
      tempPolySVG.classList.add('w-full')
      tempPolySVG.classList.add('h-full')
      tempPolySVG.style.zIndex = 9998
      tempPolySVG.setAttributeNS(null, 'version', '1.1')
    }
    tempPolySVG.setAttributeNS(null, 'width', getCanvasBoundingRect().width + 'px')
    tempPolySVG.setAttributeNS(null, 'height', getCanvasBoundingRect().height + 'px')
    tempPolySVG.setAttributeNS(
      null,
      'viewBox',
      `0 0 ${getCanvasBoundingRect().width} ${getCanvasBoundingRect().height}`
    )

    root.appendChild(tempPolySVG)

    // Polygon
    let html = '<polygon class="fill-primary-500 opacity-20" points="'
    // todo
    // replace with current canvas zoom
    let REPLACE_ME_WITH_CURRENT_CANVAS_ZOOM = $zoom
    for (let i = 0; i < _coords.length; i++) {
      let x = _coords[i].x * REPLACE_ME_WITH_CURRENT_CANVAS_ZOOM
      let y = _coords[i].y * REPLACE_ME_WITH_CURRENT_CANVAS_ZOOM
      html += `${x},${y} `
    }
    html += '"></polygon>'

    // Stroke
    html += '<polygon class="stroke-primary-500 stroke-2 fill-transparent" points="'
    REPLACE_ME_WITH_CURRENT_CANVAS_ZOOM = $zoom
    for (let i = 0; i < _coords.length; i++) {
      let x = _coords[i].x * REPLACE_ME_WITH_CURRENT_CANVAS_ZOOM
      let y = _coords[i].y * REPLACE_ME_WITH_CURRENT_CANVAS_ZOOM
      html += `${x},${y} `
    }
    html += '"></polygon>'

    // Draw points
    for (let i = 0; i < _coords.length; i++) {
      let x = _coords[i].x * REPLACE_ME_WITH_CURRENT_CANVAS_ZOOM
      let y = _coords[i].y * REPLACE_ME_WITH_CURRENT_CANVAS_ZOOM
      let objectType = i === 0 ? consts.CANVAS_OBJECT_FIRST_POLY_POINT : ''

      let firstPointClasses = i === 0 ? 'cursor-pointer fill-danger-500 stroke-2 stroke-white' : 'fill-primary-500'
      let r = i === 0 ? 6 : 4

      html += `<circle class="${firstPointClasses}" cx="${x}" cy="${y}" r="${r}" data-index="${i}" data-object-type="${objectType}"></circle>`
    }

    tempPolySVG.innerHTML = html
  }
  function redrawTempPolyTooltip(e) {
    if (e.target.dataset.objectType === consts.CANVAS_OBJECT_FIRST_POLY_POINT) {
      drawTooltipAtMouse('Close path')
    } else {
      hideTooltipAtMouse()
    }
  }
  function shouldEndDrawingPoly(e) {
    if (e.target.dataset.objectType === consts.CANVAS_OBJECT_FIRST_POLY_POINT && polyCoords.length >= 3) return true
    return false
  }
  function endDrawingPoly() {
    didStartDrawingPoly = false

    if (polyCoords.length >= 3) {
      let minCoordsPx = { x: 9999, y: 9999 }
      let maxCoordsPx = { x: 0, y: 0 }

      for (let coord of polyCoords) {
        if (coord.x < minCoordsPx.x) minCoordsPx.x = coord.x
        if (coord.x > maxCoordsPx.x) maxCoordsPx.x = coord.x
        if (coord.y < minCoordsPx.y) minCoordsPx.y = coord.y
        if (coord.y > maxCoordsPx.y) maxCoordsPx.y = coord.y
      }

      let minCoordsPercent = {
        x: (minCoordsPx.x / canvasSize.width) * 100,
        y: (minCoordsPx.y / canvasSize.height) * 100,
      }
      let maxCoordsPercent = {
        x: (maxCoordsPx.x / canvasSize.width) * 100,
        y: (maxCoordsPx.y / canvasSize.height) * 100,
      }

      let xPercent = minCoordsPercent.x
      let yPercent = minCoordsPercent.y
      let widthPercent = maxCoordsPercent.x - minCoordsPercent.x
      let heightPercent = maxCoordsPercent.y - minCoordsPercent.y

      let widthPx = maxCoordsPx.x - minCoordsPx.x
      let heightPx = maxCoordsPx.y - minCoordsPx.y

      for (let i = 0; i < polyCoords.length; i++) {
        let coordinatesInPixelsRelativeToObjectPosition = {
          x: polyCoords[i].x - minCoordsPx.x,
          y: polyCoords[i].y - minCoordsPx.y,
        }
        let coordinatesInPercentRelativeToObjectPosition = {
          x: (coordinatesInPixelsRelativeToObjectPosition.x / widthPx) * 100,
          y: (coordinatesInPixelsRelativeToObjectPosition.y / heightPx) * 100,
        }
        polyCoords[i] = coordinatesInPercentRelativeToObjectPosition
      }

      let id = setters.createPoly({
        x: xPercent,
        y: yPercent,
        width: widthPercent,
        height: heightPercent,
        points: polyCoords,
      })

      setters.setSelection([id])
      $tool = consts.TOOL_SELECT
    }

    hideTooltipAtMouse()
    tempPolySVG?.remove()
    polyCoords = []
  }
  function cancelDrawingPoly() {
    hideTooltipAtMouse()
    tempPolySVG?.remove()
    didStartDrawingPoly = false
    polyCoords = []
  }

  // Draw Text
  function shouldStartDrawingText() {
    if (
      eventStartedInCanvas &&
      $tool === consts.TOOL_TEXT &&
      areCoordsInsideCanvas(coordsCanvas) &&
      !didStartDrawingPoly
    )
      return true
    return false
  }
  function startDrawingText() {
    didStartDrawingText = true
  }
  function endDrawingText() {
    let id = setters.createText({ ...coordsCanvas })
    didStartDrawingText = false
    setters.setSelection([id])
    $tool = consts.TOOL_SELECT
  }

  // Misc
  function drawTooltipAtMouse(text) {
    if (!tooltip) {
      tooltip = document.createElement('div')
      tooltip.classList.add('fixed')
      tooltip.classList.add('bg-black')
      tooltip.classList.add('bg-opacity-80')
      tooltip.classList.add('py-1', 'px-2')
      tooltip.classList.add('rounded')
      tooltip.classList.add('text-white')
      tooltip.classList.add('text-xs')
      tooltip.classList.add('whitespace-nowrap')
      tooltip.style.zIndex = 9999
    }

    let x = coords.x - getCanvasBoundingRect().x
    let y = coords.y - getCanvasBoundingRect().y

    root.appendChild(tooltip)
    tooltip.innerHTML = text
    tooltip.style.left = x + 10 + 'px'
    tooltip.style.top = y + 10 + 'px'
  }
  function hideTooltipAtMouse() {
    tooltip?.remove()
  }

  // Helpers
  function calcDefaultCanvasSize() {
    let w = getters.getValue({ group: 'activeArtboard', prop: 'width' })
    let h = getters.getValue({ group: 'activeArtboard', prop: 'height' })

    // Get canvas background
    let canvasBgRect = document.querySelector(`[data-object-type="${consts.MAIN_ROOT}"]`)?.getBoundingClientRect()

    if (canvasBgRect) {
      canvasBgRect.width -= 80
      canvasBgRect.height -= 80

      let canvasRatio = w / h
      let bgRatio = canvasBgRect.width / canvasBgRect.height

      if (w > canvasBgRect.width || h > canvasBgRect.height) {
        if (canvasRatio <= bgRatio) {
          // Fit to height
          w = canvasBgRect.height * canvasRatio
          h = canvasBgRect.height
        } else {
          // Fit to width
          w = canvasBgRect.width
          h = canvasBgRect.width / canvasRatio
        }
      }
    }

    return { width: w, height: h }
  }
  function areCoordsInsideCanvas({ x, y }) {
    return x > 0 && x < 100 && y > 0 && y < 100
  }
  function screenToCanvas({ x, y }) {
    return {
      x: ((x - getCanvasBoundingRect().x) / getCanvasBoundingRect().width) * 100,
      y: ((y - getCanvasBoundingRect().y) / getCanvasBoundingRect().height) * 100,
    }
  }
  function limitToCanvas({ x, y }) {
    if (x < 0) x = 0
    if (x > 100) x = 100
    if (y < 0) y = 0
    if (y > 100) y = 100

    return { x, y }
  }
  function getCanvasBoundingRect() {
    if (!canvasBoundingRect) {
      canvasBoundingRect = root.getBoundingClientRect()
    }

    return canvasBoundingRect
  }
</script>

<div
  bind:this={root}
  data-object-type={consts.CANVAS_OBJECT_ROOT}
  class="bg-white z-0 select-none absolute left-auto top-auto shadow"
  style="cursor: {cursor}; width: {canvasRect.width}px; height: {canvasRect.height}px; transform: translate({canvasRect.x}px, {canvasRect.y}px);"
>
  <ArtboardMenu />
  <Highlight />
  <Selection />
  <Background />
  {#each artboards as artboard (artboard.id)}
    {#if $activeArtboard === artboard.id}
      {#each [...artboard.children].reverse() as child (child.id)}
        <Object settings={child} svg />
      {/each}
    {/if}
  {/each}
</div>
