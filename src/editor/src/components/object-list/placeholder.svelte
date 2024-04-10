<script>
  export function show() {
    root.classList.remove('hidden')
  }
  export function hide() {
    if (!root.classList.contains('hidden')) root.classList.add('hidden')
  }
  export function getOffsetTop() {
    let top = root.style.top !== '' ? root.style.top : 0
    return parseInt(top)
  }
  export function setOffsetTop(v) {
    root.style.top = v + 'px'
  }
  export function setOffsetLeft(v) {
    root.style.left = v + 'px'
  }
  export function setHeight(h) {
    root.style.height = h + 'px'
  }
  export function setWidth(h) {
    root.style.width = h + 'px'
  }

  let root
</script>

<div
  bind:this={root}
  class="
  absolute
  w-full
  p-3
  cursor-pointer
  transition-all
  select-none
  left-0
  "
>
  <div class="w-full h-full rounded-lg border-dashed border-theme-300 bg-theme-200 bg-opacity-50 dark:border-theme-600 dark:bg-theme-700 dark:bg-opacity-50 border-2" />
</div>
