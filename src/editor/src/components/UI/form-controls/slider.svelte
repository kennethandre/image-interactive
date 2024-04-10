<script>
  import { afterUpdate, onDestroy, onMount } from 'svelte'
  import FormControl from 'Editor/components/UI/form-controls/form-control'

  export let value = 0
  export let options
  export let integer
  export let onUpdate = () => {}
  export let onChange = () => {}
  export let onUpdateStart = () => {}
  export let onUpdateEnd = () => {}
  let inputWidth

  onMount(() => {
    validateValue()

    inputWidth = ((options.max + '').length - 1) * 8 + 50
    if (!integer) inputWidth += 16

    createEvents()
  })
  afterUpdate(() => {
    // validateValue()
    console.log(value)
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

  let mouse = { x: 0, y: 0 }
  let mouseInitial = { x: 0, y: 0 }
  let dragging = false
  let ballEl
  let trackEl
  let trackProgressEl
  let trackWidth
  let ballWidth = 14
  let progressInitial = 0

  function handleMouseDown(e) {
    dragging = true
    mouseInitial = {
      x: e.pageX,
      y: e.pageY,
    }

    // Cache track width
    trackWidth = trackEl.getBoundingClientRect().width

    // Calculate progress
    let progress = (mouseInitial.x - trackEl.getBoundingClientRect().left) / trackEl.getBoundingClientRect().width
    progressInitial = progress

    // Calculate value
    value = options.min + progress * (options.max - options.min)
    validateValue()

    onUpdateStart()
  }
  function handleMouseMove(e) {
    if (dragging) {
      mouse = {
        x: e.pageX,
        y: e.pageY,
      }

      // Calculate progress
      let dx = mouse.x - mouseInitial.x
      let dxPercent = dx / trackWidth
      let progress = progressInitial + dxPercent
      if (progress < 0) progress = 0
      if (progress > 1) progress = 1

      // Calculate value
      value = options.min + progress * (options.max - options.min)
      validateValue()

      onUpdate()

      e.preventDefault()
      return false
    }
  }
  function handleMouseUp() {
    if (dragging) {
      dragging = false
      onChange()
      onUpdateEnd()
    }
  }
  function validateValue() {
    if (integer) {
      value = Math.round(value)
      options.min = Math.round(options.min)
      options.max = Math.round(options.max)
    } else {
      value = parseFloat(value)
      options.min = parseFloat(options.min)
      options.max = parseFloat(options.max)
    }
    if (value < options.min) value = options.min
    if (value > options.max) value = options.max
  }
  function handleTextInputChange() {
    validateValue()
    onChange()
  }

  // When the value changes, redraw the slider progress
  $: {
    if (value !== '' && value !== undefined && value[value.length - 1] !== '.') {
      validateValue()
      let progress = (value - options.min) / (options.max - options.min)
      if (ballEl) ballEl.style.left = progress * 100 + '%'
      if (trackProgressEl) trackProgressEl.style.width = progress * 100 + '%'
    }
  }

  // Ugly, no better way
  $: draggingClass = dragging
    ? ` border-theme-300 hover:border-theme-300 active:border-theme-300 
        dark:border-theme-500 dark:hover:border-theme-500 dark:active:border-theme-500 
        bg-theme-200 hover:bg-theme-200 active:bg-theme-200 
        dark:bg-theme-600 dark:hover:bg-theme-600 dark:active:bg-theme-600`
    : ''
</script>

<div class="">
  <div class="flex w-full">
    <!-- Slider -->
    <div
      class="flex items-center w-full relative cursor-pointer mr-2"
      style="height: 24px;"
      on:mousedown={handleMouseDown}
      data-ui-type="track"
    >
      <!-- Track -->
      <div class="form-control-bg h-1 w-full rounded-full overflow-hidden pointer-events-none">
        <div class="bg-primary-500 h-1" bind:this={trackProgressEl} />
      </div>
      <!-- Ball -->
      <div class="absolute w-full" style="padding: 0 {ballWidth / 2}px;">
        <div class="relative w-full" bind:this={trackEl}>
          <div bind:this={ballEl} class="absolute top-1/2 w-0 h-0">
            <div
              on:mousedown={handleMouseDown}
              data-ui-type="ball"
              class="btn btn-light form-control-shadow form-control-border rounded-full {draggingClass}"
              style="width: {ballWidth}px; height: {ballWidth}px; margin-top: {-ballWidth /
                2}px; margin-left: {-ballWidth / 2}px"
            />
          </div>
        </div>
      </div>
    </div>
    <!-- Input -->
    <div style="width: {inputWidth}px;" class="flex-shrink-0">
      <FormControl type="number" bind:value {integer} nopadding {options} onChange={handleTextInputChange} />
    </div>
  </div>
</div>
