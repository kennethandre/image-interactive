<script>
  import { onMount } from 'svelte'

  export let value = ''

  let largeClass = ''

  if (value === 'CTRL' && !isWindows()) {
    value = '⌘'
    largeClass = 'text-xl leading-5'
  }
  if (value === 'ALT' && !isWindows()) {
    value = '⌥'
    largeClass = 'text-xl leading-5'
  }

  onMount(() => {})

  function isWindows() {
    return navigator.platform.indexOf('Win') > -1
  }
</script>

<div class="shortcut-key rounded bg-theme-300 font-mono text-theme-800 text-xs leading-5 px-2 pb-1 pt-0 m-px {largeClass}">{value}</div>

<style>
  .shortcut-key {
    min-width: 1.5rem;
    box-shadow: 0 -4px inset rgba(0, 0, 0, 0.3);
  }
</style>
