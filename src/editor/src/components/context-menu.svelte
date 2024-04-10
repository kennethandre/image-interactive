<script>
  import * as consts from 'Editor/scripts/consts'
  import * as utilities from 'Editor/scripts/utilities'
  import { getters, setters } from 'Editor/store'
  import { selected, clipboard, hiddenTooltips, hidden, zoom, minZoom, maxZoom } from 'Editor/store/ui'
  import Menu from 'Editor/components/UI/menu/menu'
  import MenuOption from 'Editor/components/UI/menu/menu-option'
  import MenuOptionGroup from 'Editor/components/UI/menu/menu-option-group'
  import { onDestroy, onMount } from 'svelte'

  let menu
  let menuInCanvas = false
  let menuInObjectList = false
  let mouseCoords = { x: 0, y: 0 }

  $: canCopyObjects = $selected.length > 0 ? true : false
  $: canPasteObjects = $clipboard.type === consts.CLIPBOARD_TYPE_OBJECTS
  $: canGroupObjects = $selected.length > 1 ? true : false
  $: canShowObjects = $selected.length > 0 && $selected.filter((obj) => $hidden.includes(obj)).length > 0 ? true : false
  $: canHideObjects = $selected.length > 0 && $selected.filter((obj) => !$hidden.includes(obj)).length > 0 ? true : false

  $: canCopyStyles = $selected.length === 1 ? true : false
  $: canPasteStyles = $selected.length > 0 && $clipboard.type === consts.CLIPBOARD_TYPE_STYLES ? true : false

  $: canCopyTooltipStyles = $selected.length === 1 ? true : false
  $: canCopyTooltipContent = $selected.length === 1 ? true : false
  $: canPasteTooltipStyles = $selected.length > 0 && $clipboard.type === consts.CLIPBOARD_TYPE_TOOLTIP_STYLES ? true : false
  $: canPasteTooltipContent = $selected.length > 0 && $clipboard.type === consts.CLIPBOARD_TYPE_TOOLTIP_CONTENT ? true : false
  $: canShowTooltip = $selected.length > 0 && $selected.filter((obj) => $hiddenTooltips.includes(obj)).length > 0 ? true : false
  $: canHideTooltip = $selected.length > 0 && $selected.filter((obj) => !$hiddenTooltips.includes(obj)).length > 0 ? true : false

  $: canDelete = $selected.length > 0 && menuInCanvas ? true : false

  $: canZoomIn = $zoom < $maxZoom && menuInCanvas ? true : false
  $: canZoomOut = $zoom > $minZoom && menuInCanvas ? true : false

  let canDeletePoint = false
  let pointToDeleteIndex = null

  onMount(() => {
    createEvents()
  })
  onDestroy(() => {
    removeEvents()
  })

  // Context menu actions
  function createEvents() {
    document.addEventListener('contextmenu', handleMouseup)
  }
  function removeEvents() {
    document.removeEventListener('contextmenu', handleMouseup)
  }
  function handleMouseup(e) {
    mouseCoords = { x: e.pageX, y: e.pageY }
    menuInCanvas = false
    menuInObjectList = false
    canDeletePoint = false

    // Object list
    if (e.target.closest('[data-object-list-item-id')) {
      let id = e.target.closest('[data-object-list-item-id').dataset.objectListItemId
      if (!$selected.includes(id)) setters.setSelection([id])
      menu.show(e.pageX, e.pageY)
      menuInObjectList = true
      e.preventDefault()
      return false
    }

    // Poly point
    if (e.target.dataset.selectionControlType === 'point') {
      menu.show(e.pageX, e.pageY)
      canDeletePoint = true
      pointToDeleteIndex = e.target.dataset.pointIndex
      e.preventDefault()
      return false
    }

    // Selected item in canvas
    if (e.target.closest('#selection')) {
      menu.show(e.pageX, e.pageY)
      menuInCanvas = true
      e.preventDefault()
      return false
    }

    // Non-selected item in canvas
    if (e.target.dataset.canvasObjectId || e.target.closest('[data-canvas-object-id')) {
      let id = e.target.dataset.canvasObjectId || e.target.closest('[data-canvas-object-id')?.dataset.canvasObjectId
      if (!$selected.includes(id)) setters.setSelection([id])
      menu.show(e.pageX, e.pageY)
      menuInCanvas = true
      e.preventDefault()
      return false
    }

    // In canvas
    if (e.target.dataset.objectType === consts.CANVAS_OBJECT_ROOT || e.target.closest('[data-object-type]')?.dataset.objectType === consts.CANVAS_OBJECT_ROOT) {
      setters.setSelection([])
      menu.toggle(e.pageX, e.pageY)
      menuInCanvas = true
      e.preventDefault()
      return false
    }

    // In object list
    if (e.target.dataset.uiObjectType === consts.UI_OBJECT_LIST || e.target.closest('[data-ui-object-type]')?.dataset.uiObjectType === consts.UI_OBJECT_LIST) {
      setters.setSelection([])
      if ($clipboard.type === consts.CLIPBOARD_TYPE_OBJECTS) {
        menu.show(e.pageX, e.pageY)
      } else {
        menu.hide()
      }
      menuInObjectList = true
      e.preventDefault()
      return false
    }

    menu.hide()
  }
  function copyObjects() {
    let value = []

    for (let id of $selected) {
      value.push(getters.getObject(id))
    }

    $clipboard = {
      type: consts.CLIPBOARD_TYPE_OBJECTS,
      value,
    }
  }
  function pasteObjects() {
    if ($clipboard.type !== consts.CLIPBOARD_TYPE_OBJECTS) return

    let objects = []
    for (let obj of $clipboard.value) {
      let clone = structuredClone(obj)
      setNewObjectId(clone)
      objects.push(clone)
    }

    if (menuInCanvas) {
      // Insert the clipboard objects at the current mouse coords
      // Apply offset to each object to preserve their relative distances
      let canvasRect = document.querySelector(`[data-object-type="${consts.CANVAS_OBJECT_ROOT}"]`).getBoundingClientRect()
      let originalObjectsRect = utilities.calcBoundingRectForObjects($clipboard.value, canvasRect)

      let destination = {
        x: ((mouseCoords.x - canvasRect.x) / canvasRect.width) * 100,
        y: ((mouseCoords.y - canvasRect.y) / canvasRect.height) * 100,
      }

      let offset = {
        x: destination.x - originalObjectsRect.x,
        y: destination.y - originalObjectsRect.y,
      }

      applyOffsetToObjects(objects, offset)

      setters.insertObjects({ objects })
    }

    if (menuInObjectList) {
      if (getters.getObject($clipboard.value[0].id).type === consts.OBJECT_ARTBOARD) {
        // If there is a selected object
        // and it's an artboard
        // insert it after the last arboard
        setters.insertObjects({ objects, parentId: null, index: getters.getArtboards().length })
      } else if ($selected.length === 1 && getters.getObject($selected[0]).type === consts.OBJECT_GROUP) {
        // If there is a selected object
        // and it's a group
        // insert the clipboard as the first child
        setters.insertObjects({ objects, parentId: $selected[0] })
      } else if ($selected.length === 1) {
        // If there is a selected object
        // insert clipboard at its parent/index
        getters.getParent($selected[0], (parent, index) => {
          setters.insertObjects({ objects, parentId: parent.id, index })
        })
      } else {
        // If there is no selected object
        // the user must have clicked below all objects
        // which always results in the last artboard
        let artboards = getters.getArtboards()
        let lastArtboardId = artboards[artboards.length - 1].id
        setters.insertObjects({ objects, parentId: lastArtboardId })
      }
    }
  }
  function showObjects() {
    $hidden = $hidden.filter((obj) => !$selected.includes(obj))
  }
  function hideObjects() {
    for (let id of $selected) {
      if (!$hidden.includes(id)) $hidden.push(id)
    }

    $hidden = $hidden
  }
  function groupObjects() {
    // The object-list can handles this best
    // because it involves sorting and flattening
    let e = new Event(consts.EVENT_GROUP_ITEMS)
    document.dispatchEvent(e)
  }
  function copyStyles() {
    let obj = getters.getObject($selected[0])
    $clipboard = {
      type: consts.CLIPBOARD_TYPE_STYLES,
      value: {
        default_style: obj.default_style,
        mouseover_style: obj.mouseover_style,
      },
    }
  }
  function pasteStyles() {
    if ($clipboard.type !== consts.CLIPBOARD_TYPE_STYLES) return

    let values = {}
    for (let id of $selected) {
      values[id] = {
        default_style: utilities.deepExtend({}, $clipboard.value.default_style),
        mouseover_style: utilities.deepExtend({}, $clipboard.value.mouseover_style),
      }
    }
    setters.setObjectValues(values)
  }
  function copyTooltipStyles() {
    let obj = getters.getObject($selected[0])
    $clipboard = {
      type: consts.CLIPBOARD_TYPE_TOOLTIP_STYLES,
      value: {
        tooltip_style: obj.tooltip_style,
      },
    }
  }
  function copyTooltipContent() {
    let obj = getters.getObject($selected[0])
    $clipboard = {
      type: consts.CLIPBOARD_TYPE_TOOLTIP_CONTENT,
      value: {
        tooltip_content: obj.tooltip_content,
      },
    }
  }
  function pasteTooltipStyles() {
    if ($clipboard.type !== consts.CLIPBOARD_TYPE_TOOLTIP_STYLES) return

    let values = {}
    for (let id of $selected) {
      values[id] = {
        tooltip_style: $clipboard.value.tooltip_style,
      }
    }

    setters.setObjectValues(values)
  }
  function pasteTooltipContent() {
    if ($clipboard.type !== consts.CLIPBOARD_TYPE_TOOLTIP_CONTENT) return

    let values = {}
    for (let id of $selected) {
      values[id] = {
        tooltip_content: $clipboard.value.tooltip_content,
      }
    }

    setters.setObjectValues(values)
  }
  function showTooltip() {
    for (let id of $selected) {
      if ($hiddenTooltips.includes(id)) $hiddenTooltips = $hiddenTooltips.filter((obj) => obj !== id)
    }
  }
  function hideTooltip() {
    for (let id of $selected) {
      if (!$hiddenTooltips.includes(id)) $hiddenTooltips.push(id)
    }

    $hidden = $hidden
  }
  function deleteObjects() {
    if ($selected.length === 0) return
    let e = new Event(consts.EVENT_DELETE_ITEMS)
    document.dispatchEvent(e)
  }
  function zoomIn() {
    let e = new Event(consts.EVENT_CONTEXT_ZOOM_IN)
    e.detail = { ...mouseCoords }
    document.dispatchEvent(e)
  }
  function zoomOut() {
    let e = new Event(consts.EVENT_CONTEXT_ZOOM_OUT)
    e.detail = { ...mouseCoords }
    document.dispatchEvent(e)
  }
  function deletePoint() {
    console.log(pointToDeleteIndex)

    let values = {}
    for (let id of $selected) {
      values[id] = {
        points: getters.getObject(id).points.filter((point, index) => index !== parseInt(pointToDeleteIndex)),
      }
    }
    setters.setObjectValues(values)
  }

  // Utilities
  function setNewObjectId(obj) {
    obj.id = utilities.uuidv4()

    if (obj.type === consts.OBJECT_GROUP || obj.type === consts.OBJECT_ARTBOARD) {
      for (let child of obj.children) {
        setNewObjectId(child)
      }
    }
  }
  function applyOffsetToObjects(objects, offset) {
    for (let obj of objects) {
      if (obj.type === consts.OBJECT_GROUP) {
        applyOffsetToObjects(obj.children, offset)
      } else {
        obj.x += offset.x
        obj.y += offset.y
      }
    }
  }
</script>

<Menu bind:this={menu} name="context menu">
  {#if canDeletePoint}
    <MenuOptionGroup>
      <MenuOption small onClick={deletePoint} icon="fa-solid fa-trash" title="Delete Point" />
    </MenuOptionGroup>
  {/if}

  {#if canCopyObjects || canPasteObjects || canGroupObjects || canShowObjects || canHideObjects}
    <MenuOptionGroup>
      {#if canCopyObjects}
        <MenuOption small onClick={copyObjects} icon="fa-solid fa-copy" title="Copy" />
      {/if}
      {#if canPasteObjects}
        <MenuOption small onClick={pasteObjects} icon="fa-solid fa-paste" title="Paste Here" />
      {/if}
      {#if canGroupObjects}
        <MenuOption small onClick={groupObjects} icon="fa-regular fa-object-group" title="Group" />
      {/if}
      {#if canShowObjects}
        <MenuOption small onClick={showObjects} icon="fa-solid fa-eye" title="Show" />
      {/if}
      {#if canHideObjects}
        <MenuOption small onClick={hideObjects} icon="fa-solid fa-eye-slash" title="Hide" />
      {/if}
    </MenuOptionGroup>
  {/if}

  {#if canCopyStyles || canPasteStyles}
    <MenuOptionGroup>
      {#if canCopyStyles}
        <MenuOption small onClick={copyStyles} icon="fa-solid fa-copy" title="Copy Styles" />
      {/if}
      {#if canPasteStyles}
        <MenuOption small onClick={pasteStyles} icon="fa-solid fa-paste" title="Paste Styles" />
      {/if}
    </MenuOptionGroup>
  {/if}

  {#if canCopyTooltipStyles || canCopyTooltipContent || canPasteTooltipStyles || canPasteTooltipContent || canShowTooltip || canHideTooltip}
    <MenuOptionGroup>
      {#if canCopyTooltipStyles}
        <MenuOption small onClick={copyTooltipStyles} icon="fa-solid fa-copy" title="Copy Tooltip Styles" />
      {/if}
      {#if canCopyTooltipContent}
        <MenuOption small onClick={copyTooltipContent} icon="fa-solid fa-copy" title="Copy Tooltip Content" />
      {/if}
      {#if canPasteTooltipStyles}
        <MenuOption small onClick={pasteTooltipStyles} icon="fa-solid fa-paste" title="Paste Tooltip Styles" />
      {/if}
      {#if canPasteTooltipContent}
        <MenuOption small onClick={pasteTooltipContent} icon="fa-solid fa-paste" title="Paste Tooltip Content" />
      {/if}
      {#if canShowTooltip}
        <MenuOption small onClick={showTooltip} icon="fa-solid fa-eye" title="Show Tooltip" />
      {/if}
      {#if canHideTooltip}
        <MenuOption small onClick={hideTooltip} icon="fa-solid fa-eye-slash" title="Hide Tooltip" />
      {/if}
    </MenuOptionGroup>
  {/if}

  {#if canDelete}
    <MenuOptionGroup>
      {#if canDelete}
        <MenuOption small onClick={deleteObjects} icon="fa-solid fa-trash" title="Delete" />
      {/if}
    </MenuOptionGroup>
  {/if}

  {#if canZoomIn || canZoomOut}
    <MenuOptionGroup>
      {#if canZoomIn}
        <MenuOption small onClick={zoomIn} icon="fa-solid fa-magnifying-glass-plus" title="Zoom In" />
      {/if}
      {#if canZoomOut}
        <MenuOption small onClick={zoomOut} icon="fa-solid fa-magnifying-glass-minus" title="Zoom Out" />
      {/if}
    </MenuOptionGroup>
  {/if}
</Menu>
