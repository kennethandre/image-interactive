<script>
  import { onMount, onDestroy } from 'svelte'
  import { store, getters } from 'Editor/store'
  import { selected, hiddenTooltips, hidden, activeArtboard, mapSettingsVisible, objectSettingsVisible, objectListVisible } from 'Editor/store/ui'
  import * as consts from 'Editor/scripts/consts'
  import * as utilities from 'Editor/scripts/utilities'
  import ContentBuilder from 'Editor/components/canvas/tooltip/content-builder/content-builder'
  import Toolbar from 'Editor/components/canvas/tooltip/toolbar'

  let subscribers = []
  let root
  let arrow
  let settings
  let css = ''
  let arrowClass
  let arrowCss
  let visible = false
  let contentBuilder

  subscribers.push(
    selected.subscribe(() => {
      redraw()
    })
  )
  subscribers.push(
    activeArtboard.subscribe(() => {
      redraw()
    })
  )
  subscribers.push(
    store.subscribe(() => {
      redraw()
    })
  )
  subscribers.push(
    hidden.subscribe(() => {
      redraw()
    })
  )
  subscribers.push(
    hiddenTooltips.subscribe(() => {
      redraw()
    })
  )
  subscribers.push(
    objectListVisible.subscribe(() => {
      setTimeout(() => {
        redraw()
      }, 200)
    })
  )
  subscribers.push(
    objectSettingsVisible.subscribe(() => {
      setTimeout(() => {
        redraw()
      }, 200)
    })
  )
  subscribers.push(
    mapSettingsVisible.subscribe(() => {
      setTimeout(() => {
        redraw()
      }, 500)
    })
  )

  onMount(() => {
    redraw()
    createEvents()
  })
  onDestroy(() => {
    subscribers.forEach((unsub) => unsub())
    subscribers = []
    removeEvents()
  })

  function createEvents() {
    document.addEventListener(consts.EVENT_FORM_CONTROL_UPDATE, handleFormControlUpdate)
    document.addEventListener(consts.EVENT_OBJECT_MOVE, handleObjectMove)
    document.addEventListener(consts.EVENT_OBJECT_SCALE, handleObjectScale)
    document.addEventListener(consts.EVENT_CANVAS_DRAG, handleCanvasDrag)
    document.addEventListener(consts.EVENT_CANVAS_ZOOM_START, handleCanvasZoomStart)
    document.addEventListener(consts.EVENT_CANVAS_ZOOM_END, handleCanvasZoomEnd)
    window.addEventListener('resize', handleWindowResize)
  }
  function removeEvents() {
    document.removeEventListener(consts.EVENT_FORM_CONTROL_UPDATE, handleFormControlUpdate)
    document.removeEventListener(consts.EVENT_OBJECT_MOVE, handleObjectMove)
    document.removeEventListener(consts.EVENT_OBJECT_SCALE, handleObjectScale)
    document.removeEventListener(consts.EVENT_CANVAS_DRAG, handleCanvasDrag)
    document.removeEventListener(consts.EVENT_CANVAS_ZOOM_START, handleCanvasZoomStart)
    document.removeEventListener(consts.EVENT_CANVAS_ZOOM_END, handleCanvasZoomEnd)
    window.removeEventListener('resize', handleWindowResize)
  }

  function handleFormControlUpdate(e) {
    if (e.detail.group !== 'selected') return
    if (!visible) return

    if (['x', 'y', 'width', 'height'].includes(e.detail.prop)) {
      settings[e.detail.prop] = e.detail.value
      setPosition()
    }

    if (e.detail.prop === 'default_style.icon_size') {
      settings.default_style.icon_size = e.detail.value
      setPosition()
    }

    if (e.detail.prop === 'tooltip_style.width') {
      settings.tooltip_style.width = e.detail.value
      root.style.width = e.detail.value + 'px'
      root.dataset.impMeasuredWidth = e.detail.value
      setPosition()
    }

    if (e.detail.prop === 'tooltip_style.offset_x') {
      settings.tooltip_style.offset_x = e.detail.value
      setPosition()
    }

    if (e.detail.prop === 'tooltip_style.offset_y') {
      settings.tooltip_style.offset_y = e.detail.value
      setPosition()
    }

    if (e.detail.prop === 'tooltip_style.padding') {
      settings.tooltip_style.padding = e.detail.value
      root.style.padding = e.detail.value + 'px'
      root.dataset.impMeasuredWidth = root.getBoundingClientRect().width
      root.dataset.impMeasuredHeight = root.getBoundingClientRect().height
      setPosition()
    }

    if (e.detail.prop === 'tooltip_style.background_color') {
      settings.tooltip_style.background_color = e.detail.value
      let colorBg = utilities.hexToRgb(settings.tooltip_style.background_color)
      root.style.backgroundColor = `rgba(${colorBg.r}, ${colorBg.g}, ${colorBg.b}, ${settings.tooltip_style.background_opacity})`
      updateArrow()
    }

    if (e.detail.prop === 'tooltip_style.background_opacity') {
      settings.tooltip_style.background_opacity = e.detail.value
      let colorBg = utilities.hexToRgb(settings.tooltip_style.background_color)
      root.style.backgroundColor = `rgba(${colorBg.r}, ${colorBg.g}, ${colorBg.b}, ${settings.tooltip_style.background_opacity})`
      updateArrow()
    }

    if (e.detail.prop === 'tooltip_style.border_radius') {
      root.style.borderRadius = e.detail.value + 'px'
    }
  }
  function handleObjectMove(e) {
    setPosition(e.detail.move.x, e.detail.move.y)
  }
  function handleObjectScale(e) {
    setPosition(e.detail.move.x, e.detail.move.y, e.detail.scale.x, e.detail.scale.y)
  }
  function handleCanvasDrag() {
    setPosition()
  }
  function handleCanvasZoomStart() {
    visible = false
  }
  function handleCanvasZoomEnd() {
    redraw()
  }
  function handleWindowResize() {
    setPosition()
  }

  function redraw() {
    if (!root) return
    updateVisibility()
    if (!visible) return

    if (contentBuilder) contentBuilder.generateModel()
    settings = structuredClone(getters.getObject($selected[0]))

    updateCSS()
    updateArrow()

    requestAnimationFrame(() => {
      root.dataset.impMeasuredWidth = root.getBoundingClientRect().width
      root.dataset.impMeasuredHeight = root.getBoundingClientRect().height
      setPosition()
    })
  }
  function updateVisibility() {
    visible = false

    // Only one object must be selected and it must exist
    if ($selected.length !== 1 || !getters.getObject($selected[0])) return

    // Object must NOT be an artboard or text
    if (getters.getObject($selected[0]).type === consts.OBJECT_ARTBOARD || getters.getObject($selected[0]).type === consts.OBJECT_TEXT) return

    // Object should have its tooltip enabled
    if (!getters.getObject($selected[0]).tooltip.enable_tooltip) return

    // Object should not be hidden
    if ($hidden.includes($selected[0])) return

    // Object's tooltip should not be hidden
    if ($hiddenTooltips.includes($selected[0])) return

    // If the object is a group, it should have events and tooltips enabled
    if (getters.getObject($selected[0]).type === consts.OBJECT_GROUP && !getters.getObject($selected[0]).single_object) return

    // Object should be child of the active artboard
    if (!getters.isObjectChildOfActiveArtboard($selected[0])) return

    visible = true
  }
  function updateCSS() {
    let newCss = ''
    let colorBg = utilities.hexToRgb(settings.tooltip_style.background_color)

    newCss += `border-radius: ${settings.tooltip_style.border_radius}px;`
    newCss += `padding: ${settings.tooltip_style.padding}px;`
    newCss += `background: rgba(${colorBg.r}, ${colorBg.g}, ${colorBg.b}, ${settings.tooltip_style.background_opacity});`
    newCss += 'transition-property: transform; -moz-transition-property: -moz-transform; -webkit-transition-property: -webkit-transform;'

    if (!settings.tooltip_style.auto_width) {
      newCss += `width: ${settings.tooltip_style.width}px;`
    } else {
      newCss += `min-width: 200px;`
    }

    css = newCss
  }
  function updateArrow() {
    let colorBg = utilities.hexToRgb(settings.tooltip_style.background_color)

    if (settings.tooltip_style.position === 'top') {
      arrowClass = 'hs-arrow hs-arrow-bottom'
      arrowCss = `border-top-color: rgba(${colorBg.r}, ${colorBg.g}, ${colorBg.b}, ${settings.tooltip_style.background_opacity});`
    }
    if (settings.tooltip_style.position === 'bottom') {
      arrowClass = 'hs-arrow hs-arrow-top'
      arrowCss = `border-bottom-color: rgba(${colorBg.r}, ${colorBg.g}, ${colorBg.b}, ${settings.tooltip_style.background_opacity});`
    }
    if (settings.tooltip_style.position === 'left') {
      arrowClass = 'hs-arrow hs-arrow-right'
      arrowCss = `border-left-color: rgba(${colorBg.r}, ${colorBg.g}, ${colorBg.b}, ${settings.tooltip_style.background_opacity});`
    }
    if (settings.tooltip_style.position === 'right') {
      arrowClass = 'hs-arrow hs-arrow-left'
      arrowCss = `border-right-color: rgba(${colorBg.r}, ${colorBg.g}, ${colorBg.b}, ${settings.tooltip_style.background_opacity});`
    }
  }
  function setPosition(moveX = 0, moveY = 0, scaleX = 1, scaleY = 1) {
    if (!visible) return

    let distance = 20
    let canvasRect = document.querySelector(`[data-object-type="${consts.CANVAS_OBJECT_ROOT}"]`).getBoundingClientRect()
    let objectRect = getObjectRect(moveX, moveY, scaleX, scaleY)

    // Calculate and set the position
    let x, y
    if (settings.tooltip_style.position === 'left') {
      x = objectRect.x - parseInt(root.dataset.impMeasuredWidth) - distance
      y = objectRect.y + objectRect.height / 2 - parseInt(root.dataset.impMeasuredHeight) / 2
    }
    if (settings.tooltip_style.position === 'right') {
      x = objectRect.x + objectRect.width + distance
      y = objectRect.y + objectRect.height / 2 - parseInt(root.dataset.impMeasuredHeight) / 2
    }
    if (settings.tooltip_style.position === 'top') {
      x = objectRect.x + objectRect.width / 2 - parseInt(root.dataset.impMeasuredWidth) / 2
      y = objectRect.y - parseInt(root.dataset.impMeasuredHeight) - distance
    }
    if (settings.tooltip_style.position === 'bottom') {
      x = objectRect.x + objectRect.width / 2 - parseInt(root.dataset.impMeasuredWidth) / 2
      y = objectRect.y + objectRect.height + distance
    }

    // Apply tooltip position offset from settings
    x += (settings.tooltip_style.offset_x / 100) * canvasRect.width
    y += (settings.tooltip_style.offset_y / 100) * canvasRect.height

    // Offset from canvas origin
    x += canvasRect.x
    y += canvasRect.y

    // Limit to window
    if (x < 0) x = 0
    if (y < 0) y = 0
    if (x + parseInt(root.dataset.impMeasuredWidth) > window.innerWidth - 30) x = window.innerWidth - parseInt(root.dataset.impMeasuredWidth) - 30
    if (y + parseInt(root.dataset.impMeasuredHeight) > window.innerHeight) y = window.innerHeight - parseInt(root.dataset.impMeasuredHeight)

    // Apply the position to the element
    root.style.left = x + 'px'
    root.style.top = y + 'px'
  }
  function getObjectRect(moveX = 0, moveY = 0, scaleX = 0, scaleY = 0) {
    let canvasRect = document.querySelector(`[data-object-type="${consts.CANVAS_OBJECT_ROOT}"]`).getBoundingClientRect()
    let rect = utilities.calcBoundingRectForObjects([settings], canvasRect)

    // Convert to pixels, relative to canvas
    // also apply move and scale, which are temp values from fast updating controls
    rect = {
      x: (Math.round((rect.x + moveX) * 10) / 10 / 100) * canvasRect.width,
      y: (Math.round((rect.y + moveY) * 10) / 10 / 100) * canvasRect.height,
      width: ((rect.width * scaleX) / 100) * canvasRect.width,
      height: ((rect.height * scaleY) / 100) * canvasRect.height,
    }

    return rect
  }
</script>

<div bind:this={root} style="{css} {visible ? 'display: block;' : 'display: none;'} z-index: 9999;" class="imp-tooltip fixed">
  <Toolbar />
  <div bind:this={arrow} class={arrowClass} style={arrowCss} />
  <div class="tooltip-content">
    <ContentBuilder bind:this={contentBuilder} group="selected" prop="tooltip_content" />
  </div>
</div>
