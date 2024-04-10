<script>
  export let label
  export let onClick = () => {}
  export let icon
  export let active

  $: activeClass = active ? 'bg-primary-500 dark:hover:bg-primary-400 hover:bg-primary-600 opacity-100' : ''
</script>

<div
  class="
  flex
  flex-col
  items-center
  justify-center
  rounded-lg
  px-2
  text-xs
  text-center
  select-none
  cursor-pointer
  opacity-50
  active:opacity-100
  hover:bg-theme-200
  dark:hover:bg-theme-800
  active:bg-primary-500
  dark:active:bg-primary-500
  active:text-white
  {activeClass}
  w-[64px]
  h-[64px]
  "
  on:click={onClick}
  on:keypress={onClick}
>
  <div class="{icon} mb-1 text-base" />
  {label}
</div>
