<script>
  import { slide, fade } from 'svelte/transition'

  export let title
  export let opacity = 1
  export let collapsed = false

  function toggle() {
    collapsed = !collapsed
  }
</script>

<div class="pt-2 -ml-1 -mr-1">
  <div class="bg-theme-200 dark:bg-theme-700 h-px" style="opacity: {opacity}" />
</div>

<div class="h-8 flex items-center text-sm p-1 cursor-pointer select-none" on:click={() => (collapsed = !collapsed)} on:keypress={() => (collapsed = !collapsed)}>
  <div class="fa-solid fa-angle-down {collapsed ? '-rotate-90' : ''} mr-1 w-3 transition-all duration-100 flex justify-center opacity-50 text-xs" />
  <div class="opacity-50">
    {title}
  </div>
</div>

{#if !collapsed}
  <div transition:fade|local={{ duration: 250 }}>
    <div transition:slide|local={{ duration: 250 }}>
      <div class="p-2">
        <slot />
      </div>
    </div>
  </div>
{/if}
