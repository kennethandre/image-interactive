<script>
  import { onDestroy, onMount } from 'svelte'

  export let value = 0
  export let label
  export let onChange = () => {}
  export let onUpdate = () => {}
  export let onUpdateStart = () => {}
  export let onUpdateEnd = () => {}
  export let integer
  export let min
  export let max

  onMount(() => {
    createEvents()
  })
  onDestroy(() => {
    removeEvents()
  })

  function createEvents() {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }
  function removeEvents() {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  let input
  let mouse = { x: 0, y: 0 }
  let mouseInitial = { x: 0, y: 0 }
  let dragging = false
  let valueInitial

  function handleMouseDown(e) {
    mouseInitial = {
      x: e.pageX,
      y: e.pageY,
    }
    dragging = true
    if (isNaN(value)) value = 0
    valueInitial = value
    onUpdateStart()
  }
  function handleMouseMove(e) {
    if (dragging) {
      input.classList.add('select-none')

      mouse = {
        x: e.pageX,
        y: e.pageY,
      }

      if (integer) {
        value = parseInt(valueInitial + mouse.x - mouseInitial.x)
      } else {
        value = valueInitial + Math.round((mouse.x - mouseInitial.x) * 0.1 * 10) / 10
      }
      if (min !== undefined && value < min) value = min
      if (max !== undefined && value < max) value = max

      onUpdate()
      clearSelection(e)
    }
  }
  function handleMouseUp(e) {
    if (dragging) {
      dragging = false
      input.classList.remove('select-none')
      onChange()
      clearSelection(e)
      onUpdateEnd()
    }
  }

  function increase(e) {
    e.preventDefault()
    if (isNaN(value)) value = 0
    value++
    onChange()
  }
  function decrease(e) {
    e.preventDefault()
    if (isNaN(value)) value = 0
    value--
    onChange()
  }
  function _onChange() {
    if (integer) {
      value = parseInt(value)
    } else {
      value = parseFloat(value)
    }
    if (min !== undefined && value < min) value = min
    if (max !== undefined && value < max) value = max
    if (isNaN(value)) value = 0
    onChange()
  }
  function clearSelection(e) {
    e.preventDefault()
    if (window.getSelection().empty) {
      window.getSelection().empty()
    } else if (window.getSelection().removeAllRanges) {
      window.getSelection().removeAllRanges()
    }
  }
</script>

<div class="flex flex-col items-center">
  <div class="flex w-full">
    <input
      type="text"
      bind:value
      bind:this={input}
      on:change={_onChange}
      style="height: 24px;"
      class="
      flex-1
      w-full
      p-1
      px-1.5
      rounded rounded-r-none
      outline-none
      form-control-ring
      form-control-bg
      transition-all duration-200"
    />
    <div class="flex flex-col ml-0.5 rounded rounded-l-none w-4">
      <div
        on:click={increase}
        on:keypress={increase}
        on:mousedown={clearSelection}
        class="fa-solid fa-angle-up flex justify-center items-center h-1/2 cursor-pointer rounded-tr transition-all duration-200 form-control-bg active:bg-opacity-40 dark:active:bg-opacity-100"
        style="font-size: 10px;"
      />
      <div
        on:click={decrease}
        on:keypress={decrease}
        on:mousedown={clearSelection}
        class="fa-solid fa-angle-down flex justify-center items-center h-1/2 cursor-pointer rounded-br transition-all duration-200 form-control-bg active:bg-opacity-40 dark:active:bg-opacity-100"
        style="font-size: 10px;"
      />
    </div>
  </div>
  {#if label}
    <div style="margin-top: 2px; font-size: 11px;" class="select-none px-2 text-center cursor-ew-resize" on:mousedown={handleMouseDown}>{label}</div>
  {/if}
</div>
