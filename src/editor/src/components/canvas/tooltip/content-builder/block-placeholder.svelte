<script>
  export let index

  let root

  export function show() {
    root.style.opacity = 1
  }
  export function hide() {
    root.style.opacity = 0
  }
  export function getOffsetTop() {
    return root.getBoundingClientRect().y
  }
  export function getIndex() {
    return parseInt(index)
  }
</script>

<div bind:this={root} data-index={index} class="block-placeholder relative opacity-0">
  <div class="absolute w-full h-2 -mt-1 px-2">
    <div class="h-full bg-primary-500 rounded-xl" />
  </div>
</div>
