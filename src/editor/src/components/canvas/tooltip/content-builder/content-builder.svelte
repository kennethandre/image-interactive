<script>
  /*
  Notes:
    - every content component has its own margin of 15px, no padding by default
    - the tooltip is flex, direction column, no padding
    - components can be moved up/down with arrow buttons with animation. Animation - detect offset top, swap places and apply the offset top as transform, then animate the transform to zero
    - components can be dragged by displaying an indicator of the new position, no animation. When user starts dragging, the component is cut.
    - editable components with contenteditable="true"
    - no option for multiple columns
    - option to edit as HTML - replaces the content with textarea
    - components:
      - content block
      - insert new content block button
      - content block toolbar with buttons and menus.
      - component for each button
      - component for each menu, as child to a button
      - content components:
        - heading
        - paragraph
        - image
        - button - follow link or run JS
        - video
        - YouTube
    - dynamically add/remove components - https://svelte.dev/repl/28996f04783542ceafed7cc6a85128b9?version=3.23.0
    - manage selection within editable component - https://developer.mozilla.org/en-US/docs/Web/API/Selection
    - dark mode for the toolbar and child components
    - UI inside the content area must be clearly visible against any background
  */

  import { flip } from 'svelte/animate'
  import { cubicOut } from 'svelte/easing'
  import { crossfade } from 'svelte/transition'
  import { store, getters, setters } from 'Editor/store'
  import { onDestroy, onMount, setContext } from 'svelte'
  import * as utilities from 'Editor/scripts/utilities'
  import * as clientDefaults from 'Client/scripts/defaults'
  import * as consts from 'Editor/scripts/consts'
  import Block from 'Editor/components/canvas/tooltip/content-builder/block'
  import BlockInserter from 'Editor/components/canvas/tooltip/content-builder/block-inserter'
  import BlockPlaceholder from 'Editor/components/canvas/tooltip/content-builder/block-placeholder'

  export let model = []
  export let group
  export let prop

  let subscribers = []
  let root
  let blocks = []
  let placeholders = []
  let lastPlaceholder

  const [send, receive] = crossfade({
    duration: (d) => Math.sqrt(d * 200),

    fallback(node, params) {
      const style = getComputedStyle(node)
      const transform = style.transform === 'none' ? '' : style.transform

      return {
        duration: 250,
        easing: cubicOut,
        // css: (t) => `
        //   transform: ${transform} scale(${t});
        //   opacity: ${t}
        // `,
        css: (t) => `
          opacity: ${t}
        `,
      }
    },
  })

  onMount(() => {
    createEvents()
  })
  onDestroy(() => {
    subscribers.forEach((unsub) => unsub())
    subscribers = []
    removeEvents()
  })

  setContext('content-builder', {
    addBlock: (type) => {
      addBlock(type)
      writeModel()
    },
    onEdit: () => {
      writeModel()
    },
    onDelete: (id) => {
      let newModel = []
      for (let block of model) {
        if (block.id !== id) newModel.push(block)
      }
      model = newModel
      writeModel()
    },
    onMoveUp: (id) => {
      let index = getBlockIndex(id)
      if (index > 0) {
        moveBlockUp(id)
        writeModel()
      }
    },
    onMoveDown: (id) => {
      let index = getBlockIndex(id)
      if (index < model.length - 1) {
        moveBlockDown(id)
        writeModel()
      }
    },
    onDragStart: (id) => {
      startDraggingBlock(id)
    },
  })

  subscribers.push(
    store.subscribe(() => {
      generateModel()
    })
  )

  function addBlock(type) {
    if (type === consts.CONTENT_BLOCK_PARAGRAPH) {
      let settings = utilities.deepExtend({}, clientDefaults.tooltipContentDefaults.paragraph)
      settings.id = utilities.uuidv4()
      model.push(settings)
    }
    if (type === consts.CONTENT_BLOCK_HEADING) {
      let settings = utilities.deepExtend({}, clientDefaults.tooltipContentDefaults.heading)
      settings.id = utilities.uuidv4()
      model.push(settings)
    }
    if (type === consts.CONTENT_BLOCK_BUTTON) {
      let settings = utilities.deepExtend({}, clientDefaults.tooltipContentDefaults.button)
      settings.id = utilities.uuidv4()
      model.push(settings)
    }
    if (type === consts.CONTENT_BLOCK_IMAGE) {
      let settings = utilities.deepExtend({}, clientDefaults.tooltipContentDefaults.image)
      settings.id = utilities.uuidv4()
      model.push(settings)
    }
    if (type === consts.CONTENT_BLOCK_VIDEO) {
      let settings = utilities.deepExtend({}, clientDefaults.tooltipContentDefaults.video)
      settings.id = utilities.uuidv4()
      model.push(settings)
    }
    if (type === consts.CONTENT_BLOCK_YOUTUBE) {
      let settings = utilities.deepExtend({}, clientDefaults.tooltipContentDefaults.youtube)
      settings.id = utilities.uuidv4()
      model.push(settings)
    }
  }
  function writeModel() {
    setters.setValue({ group, prop, value: model })
    model = model
  }
  export function generateModel() {
    let val = getters.getValue({ group, prop }) || []
    model = JSON.parse(JSON.stringify(val))

    for (let index in model) {
      if (model[index].type === consts.CONTENT_BLOCK_PARAGRAPH) {
        model[index] = utilities.deepExtend({}, clientDefaults.tooltipContentDefaults.paragraph, model[index])
        model[index].id = model[index].id || utilities.uuidv4()
      }
      if (model[index].type === consts.CONTENT_BLOCK_HEADING) {
        model[index] = utilities.deepExtend({}, clientDefaults.tooltipContentDefaults.heading, model[index])
        model[index].id = model[index].id || utilities.uuidv4()
      }
      if (model[index].type === consts.CONTENT_BLOCK_BUTTON) {
        model[index] = utilities.deepExtend({}, clientDefaults.tooltipContentDefaults.button, model[index])
        model[index].id = model[index].id || utilities.uuidv4()
      }
      if (model[index].type === consts.CONTENT_BLOCK_IMAGE) {
        model[index] = utilities.deepExtend({}, clientDefaults.tooltipContentDefaults.image, model[index])
        model[index].id = model[index].id || utilities.uuidv4()
      }
      if (model[index].type === consts.CONTENT_BLOCK_VIDEO) {
        model[index] = utilities.deepExtend({}, clientDefaults.tooltipContentDefaults.video, model[index])
        model[index].id = model[index].id || utilities.uuidv4()
      }
      if (model[index].type === consts.CONTENT_BLOCK_YOUTUBE) {
        model[index] = utilities.deepExtend({}, clientDefaults.tooltipContentDefaults.youtube, model[index])
        model[index].id = model[index].id || utilities.uuidv4()
      }
    }

    model = model
  }

  // Move functionality
  let dragging = false
  let startingCoords = { x: 0, y: 0 }
  let deltaCoords = { x: 0, y: 0 }
  let draggedBlockID
  let draggedBlockIndex
  let closestPlaceholderIndex

  function createEvents() {
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('copy', handleCopy)
  }
  function removeEvents() {
    document.removeEventListener('mousedown', handleMouseDown)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    document.removeEventListener('copy', handleCopy)
  }
  function handleMouseDown(e) {
    startingCoords = { x: e.pageX, y: e.pageY }
  }
  function handleMouseMove(e) {
    deltaCoords = { x: e.pageX - startingCoords.x, y: e.pageY - startingCoords.y }
    if (dragging) dragBlock(e)
  }
  function handleMouseUp() {
    if (dragging) endDraggingBlock()
  }
  function handleCopy(e) {
    const text_only = document.getSelection().toString()
    const clipdata = e.clipboardData || window.clipboardData
    clipdata.setData('text/plain', text_only)
    clipdata.setData('text/html', text_only)
    e.preventDefault()
  }
  function getBlockIndex(id) {
    let index = 0
    for (let block of model) {
      if (block.id === id) break
      index++
    }
    return index
  }
  function moveBlockUp(id) {
    let index = getBlockIndex(id)
    if (index === 0) return false

    let tmp = model[index - 1]
    model[index - 1] = model[index]
    model[index] = tmp

    return index
  }
  function moveBlockDown(id) {
    let index = getBlockIndex(id)
    if (index === model.length - 1) return false

    let tmp = model[index + 1]
    model[index + 1] = model[index]
    model[index] = tmp

    return index
  }
  function startDraggingBlock(id) {
    dragging = true
    draggedBlockID = id
    draggedBlockIndex = getBlockIndex(draggedBlockID)
    blocks[draggedBlockID].hideContent()
    blocks[draggedBlockID].setZ(9999)
    blocks[draggedBlockID].setOpacity(0.5)
    placeholders[model.length] = lastPlaceholder

    placeholders = []
    root.querySelectorAll('.block-placeholder').forEach((el) => {
      placeholders.push(el)
    })
  }
  function dragBlock() {
    // update position
    blocks[draggedBlockID].setTranslate(deltaCoords)

    // find closest block placeholder
    let draggedBlockOffsetTop = blocks[draggedBlockID].getOffsetTop()
    let smallestDistance = 9999

    for (let placeholder of placeholders) {
      if (placeholder.dataset.index === draggedBlockIndex + 1) continue
      let d = Math.abs(placeholder.getBoundingClientRect().y - draggedBlockOffsetTop)
      if (d < smallestDistance) {
        smallestDistance = d
        closestPlaceholderIndex = placeholder.dataset.index
      }
    }

    // highlight the placeholder
    for (let placeholder of placeholders) {
      if (placeholder.dataset.index === draggedBlockIndex + 1) continue
      if (placeholder.dataset.index !== closestPlaceholderIndex) {
        placeholder.style.opacity = 0
      } else {
        placeholder.style.opacity = 1
      }
    }

    // if the placeholder is after the dragged block's original index,
    // reduce the target index by 1
    if (closestPlaceholderIndex > draggedBlockIndex) closestPlaceholderIndex--
  }
  function endDraggingBlock() {
    dragging = false
    blocks[draggedBlockID].clearTransform()
    blocks[draggedBlockID].showContent()
    blocks[draggedBlockID].setZ(1)
    blocks[draggedBlockID].setOpacity(1)

    // hide placeholders
    for (let index in placeholders) {
      placeholders[index].style.opacity = 0
    }

    // move block to target index
    if (closestPlaceholderIndex > model.length - 1) closestPlaceholderIndex = model.length - 1

    model = array_move(model, draggedBlockIndex, closestPlaceholderIndex)
    // writeModel()
  }
  function array_move(arr, old_index, new_index) {
    if (new_index >= arr.length) {
      var k = new_index - arr.length + 1
      while (k--) {
        arr.push(undefined)
      }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0])
    return arr // for testing
  }
</script>

<div id="content-builder" bind:this={root}>
  {#each model as blockSettings, index (blockSettings.id)}
    <!-- The Block component will set z-index of this element when transitioning! -->
    <div animate:flip={{ duration: 250 }} class="relative">
      <!-- <div animate:flip={{ duration: 250 }} in:receive={{ key: blockSettings.id }} out:send={{ key: blockSettings.id }} class="relative"> -->
      <BlockPlaceholder bind:this={placeholders[index]} {index} />
      <Block bind:settings={blockSettings} bind:this={blocks[blockSettings.id]} />
    </div>
  {/each}
  <BlockPlaceholder bind:this={lastPlaceholder} index={model.length} />
  <BlockInserter />
</div>

<style>
</style>
