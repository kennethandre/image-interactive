<script>
  import { hidden, hiddenTooltips } from 'Editor/store/ui'
  import { getContext } from 'svelte'
  import Object from 'Editor/components/object-list/object'
  import Group from 'Editor/components/object-list/group'
  import Artboard from 'Editor/components/object-list/artboard'

  export let id
  export let title
  export let type
  export let selected
  export let childrenCount
  export let collapsed
  export let single_object

  let root
  let dragging
  let highlighted
  let visible = true

  export function getOffsetTop() {
    let top = root.style.top !== '' ? root.style.top : 0
    return parseInt(top)
  }
  export function getOffsetLeft() {
    let left = root.style.left !== '' ? root.style.left : 0
    return parseInt(left)
  }
  export function getWidth() {
    return parseInt(getComputedStyle(root).width)
  }
  export function getHeight() {
    return parseInt(getComputedStyle(root).height)
  }
  export function setOffsetTop(v) {
    root.style.top = v + 'px'
  }
  export function setOffsetLeft(v) {
    root.style.left = v + 'px'
  }
  export function setWidth(v) {
    root.style.width = v + 'px'
  }
  export function setHeight(v) {
    root.style.height = v + 'px'
  }
  export function show() {
    root.style.height = '40px'
    root.style.opacity = 1
    visible = true
  }
  export function hide() {
    root.style.height = 0
    root.style.opacity = 0
    visible = false
  }
  export function addTransitions() {
    root.classList.add('transition-all')
    root.style.pointerEvents = 'all'
  }
  export function removeTransitions() {
    root.classList.remove('transition-all')
    root.style.pointerEvents = 'none'
  }
  export function setDragStyle() {
    dragging = true
    root.style.opacity = 0.5
    root.style.zIndex = 9999
  }
  export function removeDragStyle() {
    dragging = false
    root.style.opacity = 1
    root.style.zIndex = 0
  }
  export function highlight() {
    if (!highlighted) {
      highlighted = true
    }
  }
  export function unhighlight() {
    if (highlighted) {
      highlighted = false
    }
  }

  // Event handling
  let context = getContext('object-list')
  let mouseDown = false
  let mouseDownCoords = { x: 0, y: 0 }
  function handleMouseDown(e) {
    if (e.button === 0) {
      context.mouseDown(id)
      mouseDown = true
      mouseDownCoords = { x: e.pageX, y: e.pageY }
    }
  }
  function handleMouseUp(e) {
    if (e.target.classList.contains('list-item-expand-button')) return
    if (e.target.classList.contains('list-item-hide-icon')) {
      if (!$hidden.includes(id)) {
        $hidden = [...$hidden, id]
      } else {
        $hidden = $hidden.filter((a) => a !== id)
      }
      return
    }
    if (e.target.classList.contains('list-item-tooltip-hide-icon')) {
      if (!$hiddenTooltips.includes(id)) {
        $hiddenTooltips = [...$hiddenTooltips, id]
      } else {
        $hiddenTooltips = $hiddenTooltips.filter((a) => a !== id)
      }
      return
    }
    if (e.button === 0 && mouseDown && Math.abs(mouseDownCoords.x - e.pageX) <= 2 && Math.abs(mouseDownCoords.y - e.pageY) <= 2) {
      context.select(id)
    }
    mouseDown = false
  }
</script>

<div
  bind:this={root}
  data-object-list-item-id={id}
  on:mousedown={handleMouseDown}
  on:mouseup={handleMouseUp}
  class="
    absolute 
    select-none 
    cursor-pointer"
>
  {#if type === 'artboard'}
    <Artboard {id} {title} {selected} {collapsed} {highlighted} {dragging} />
  {/if}
  {#if type === 'group'}
    <Group {id} {title} {selected} {childrenCount} {collapsed} {highlighted} {dragging} {visible} single={single_object} />
  {/if}
  {#if type !== 'artboard' && type !== 'group'}
    <Object {id} {title} {type} {selected} {dragging} />
  {/if}
</div>
