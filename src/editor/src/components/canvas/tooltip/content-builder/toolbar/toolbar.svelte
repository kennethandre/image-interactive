<script>
  import { onMount } from 'svelte'
  let root

  onMount(() => {
    root.classList.add('hidden')
  })

  export function show() {
    root.classList.remove('hidden')
  }
  export function hide() {
    root.classList.add('hidden')
  }
  export function toggle() {
    root.classList.toggle('hidden')
  }
</script>

<div bind:this={root} class="content-builder-toolbar ui flex h-10 px-2 items-center text-sm">
  <slot />
</div>
