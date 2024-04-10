<script>
  import { onDestroy, onMount, getContext } from 'svelte'
  import { getters } from 'Editor/store'
  import { selected, tool } from 'Editor/store/ui'
  import * as consts from 'Editor/scripts/consts'
  import * as utilities from 'Editor/scripts/utilities'

  let subscribers = []
  let context = getContext('canvas')
  let root
  let rect = { width: 0, height: 0, x: 0, y: 0 }
  let highlightedObjectId
  let canHighlight = true
  let lastId

  onMount(() => {
    createEvents()
  })
  onDestroy(() => {
    subscribers.forEach((unsub) => unsub())
    subscribers = []
    removeEvents()
  })
  subscribers.push(
    selected.subscribe(() => {
      if ($selected.includes(highlightedObjectId)) hide()
    })
  )
  subscribers.push(
    tool.subscribe(() => {
      if ($tool !== consts.TOOL_SELECT) hide()
    })
  )

  function createEvents() {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener(consts.EVENT_OBJECT_TRANSFORM_START, handleTransformStart)
    document.addEventListener(consts.EVENT_OBJECT_TRANSFORM_END, handleTransformEnd)
  }
  function removeEvents() {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener(consts.EVENT_OBJECT_TRANSFORM_START, handleTransformStart)
    document.removeEventListener(consts.EVENT_OBJECT_TRANSFORM_END, handleTransformEnd)
  }
  function handleMouseMove(e) {
    if ($tool !== consts.TOOL_SELECT) return

    let id = e.target.dataset.canvasObjectId || e.target.closest(`[data-canvas-object-id]`)?.dataset.canvasObjectId || e.target.closest(`[data-object-list-item-id]`)?.dataset.objectListItemId

    if (id === lastId) return
    lastId = id

    if (id) {
      if (getters.isObjectChildOfActiveArtboard(id)) {
        let obj = getters.getObject(id)
        rect = utilities.calcBoundingRectForObjects([obj], context.getCanvasRect())
        highlightedObjectId = id
        show()
      } else {
        hide()
      }
    } else {
      hide()
    }
  }
  function handleTransformStart() {
    canHighlight = false
  }
  function handleTransformEnd() {
    canHighlight = true
  }
  function show() {
    if (rect === undefined) {
      hide()
      return
    }

    if (root && canHighlight) {
      root.style.display = 'block'
    }
  }
  function hide() {
    if (root) root.style.display = 'none'

    highlightedObjectId = undefined
  }
</script>

<div bind:this={root} class="absolute pointer-events-none" style="z-index: 9997; display: none; width: {rect.width}%; height: {rect.height}%; left: {rect.x}%; top: {rect.y}%;">
  <div class="outline outline-2 outline-primary-500 w-full h-full" />
</div>
