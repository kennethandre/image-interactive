<script>
  import { getContext, onDestroy, onMount } from 'svelte'
  import { hidden, selected } from 'Editor/store/ui'
  import { getters } from 'Editor/store'
  import { tool } from 'Editor/store/ui'
  import * as consts from 'Editor/scripts/consts'

  import Spot from 'Editor/components/canvas/objects/spot'
  import Rect from 'Editor/components/canvas/objects/rect'
  import Oval from 'Editor/components/canvas/objects/oval'
  import Poly from 'Editor/components/canvas/objects/poly'
  import Text from 'Editor/components/canvas/objects/text'
  import SVG from 'Editor/components/canvas/objects/svg'
  import SVGSingle from 'Editor/components/canvas/objects/svg-single'

  export let settings

  let tempSettings
  let subscribers = []
  let context = getContext('canvas')
  let component
  let mouseDownOverObject
  let didStartQuickDrag

  onMount(() => {
    createEvents()
  })

  onDestroy(() => {
    subscribers.forEach((unsub) => unsub())
    subscribers = []
    removeEvents()
  })

  // Computed variables
  let isHidden = false
  let isSelected = false
  $: cursor = $tool === consts.TOOL_SELECT ? 'pointer' : 'inherit'

  subscribers.push(
    hidden.subscribe(() => {
      isHidden = $hidden.includes(settings.id)
    })
  )

  subscribers.push(
    selected.subscribe(() => {
      isSelected = false

      // Is there an object selected?
      if ($selected.length === 0) {
        return
      }

      // Is the object an artboard?
      if (getters.getObject($selected[0]).type === consts.OBJECT_ARTBOARD) {
        return
      }

      // Is the object selected?
      if ($selected.includes(settings.id)) {
        isSelected = true
        return
      }

      // If not, is it a child of a selected object?
      if (!isSelected) {
        for (let id of $selected) {
          let selectedObject = getters.getObject(id)
          let childrenOfSelected = getters.getChildren({ parent: selectedObject }).map((o) => o.id)
          if (childrenOfSelected.includes(settings.id)) {
            isSelected = true
          }
        }
      }
    })
  )

  // Events
  function createEvents() {
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener(consts.EVENT_FORM_CONTROL_UPDATE, handleFormControlUpdate)
    document.addEventListener(consts.EVENT_OBJECT_MOVE, handleMove)
    document.addEventListener(consts.EVENT_OBJECT_SCALE, handleScale)
    document.addEventListener(consts.EVENT_OBJECT_EDIT_POLY, handleEditPoly)
  }
  function removeEvents() {
    document.removeEventListener('mousedown', handleMouseDown)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    document.removeEventListener(consts.EVENT_FORM_CONTROL_UPDATE, handleFormControlUpdate)
    document.removeEventListener(consts.EVENT_OBJECT_MOVE, handleMove)
    document.removeEventListener(consts.EVENT_OBJECT_SCALE, handleScale)
    document.removeEventListener(consts.EVENT_OBJECT_EDIT_POLY, handleEditPoly)
  }

  // Handlers
  function handleMouseDown(e) {
    if (e.target.dataset.canvasObjectId === settings.id || e.target.closest(`[data-canvas-object-id="${settings.id}"]`)) {
      context.select(settings.id)
      mouseDownOverObject = true
    }
  }
  function handleMouseMove() {
    if (mouseDownOverObject && !didStartQuickDrag && $tool === consts.TOOL_SELECT) {
      didStartQuickDrag = true
      document.dispatchEvent(new Event(consts.EVENT_OBJECT_QUICK_DRAG))
    }
  }
  function handleMouseUp() {
    mouseDownOverObject = false
    didStartQuickDrag = false
  }
  function handleFormControlUpdate(e) {
    if (e.detail.group === 'selected' && isSelected && settings.type !== consts.OBJECT_GROUP) {
      let props = e.detail.prop.split('.')
      let obj = {}

      // Convert path string, (like "default_settings.background_color") to object
      let currentProp = obj
      while (props.length > 0) {
        currentProp[props[0]] = {}
        if (props.length === 1) currentProp[props[0]] = e.detail.value
        else currentProp = currentProp[props[0]]
        props.shift()
      }

      tempSettings = obj
    }
  }
  function handleMove(e) {
    if (e.detail.ids.includes(settings.id) && component) {
      tempSettings = {
        x: settings.x + e.detail.move.x,
        y: settings.y + e.detail.move.y,
      }
    }
  }
  function handleScale(e) {
    if (e.detail.ids.includes(settings.id) && component) {
      tempSettings = {
        x: settings.x + e.detail.movePerObject[settings.id].x,
        y: settings.y + e.detail.movePerObject[settings.id].y,
        width: settings.width * e.detail.scale.x,
        height: settings.height * e.detail.scale.y,
      }
    }
  }
  function handleEditPoly(e) {
    if (e.detail.id === settings.id && component && settings.type === consts.OBJECT_POLY) {
      tempSettings = {
        x: e.detail.x,
        y: e.detail.y,
        width: e.detail.width,
        height: e.detail.height,
        points: e.detail.points,
      }
    }
  }
</script>

{#if !isHidden}
  {#if settings.type === consts.OBJECT_SPOT}
    <Spot bind:this={component} {settings} {tempSettings} {cursor} />
  {/if}
  {#if settings.type === consts.OBJECT_RECT}
    <Rect bind:this={component} {settings} {tempSettings} {cursor} />
  {/if}
  {#if settings.type === consts.OBJECT_OVAL}
    <Oval bind:this={component} {settings} {tempSettings} {cursor} />
  {/if}
  {#if settings.type === consts.OBJECT_POLY}
    <Poly bind:this={component} {settings} {tempSettings} {cursor} />
  {/if}
  {#if settings.type === consts.OBJECT_TEXT}
    <Text bind:this={component} {settings} {tempSettings} {cursor} />
  {/if}
  {#if settings.type === consts.OBJECT_SVG}
    <SVG bind:this={component} {settings} {tempSettings} {cursor} />
  {/if}
  {#if settings.type === consts.OBJECT_SVG_SINGLE}
    <SVGSingle bind:this={component} {settings} {tempSettings} {cursor} />
  {/if}
  {#if settings.type === consts.OBJECT_GROUP}
    {#each [...settings.children].reverse() as child (child.id)}
      <svelte:self settings={child} />
    {/each}
  {/if}
{/if}
