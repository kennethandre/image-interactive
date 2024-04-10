<script>
  import { fade } from 'svelte/transition'
  export let value = ''
  export let onChange = () => {}
  export let onUpdate = () => {}
  export let placeholder

  $: active = value.length > 2

  function _onUpdate() {
    onUpdate()
  }
  function clearSearch() {
    value = ''
    onUpdate()
  }
</script>

<div class="flex flex-col items-center">
  <div class="relative w-full">
    <div class="fa-solid fa-search absolute left-0 top-0 flex justify-center items-center opacity-50 {active ? 'text-white' : 'text-theme-700 dark:text-white'}" style="width: 24px; height: 24px;" />
    <input
      type="text"
      bind:value
      on:keyup={_onUpdate}
      on:change={onChange}
      {placeholder}
      style="height: 24px;"
      class="
      w-full
      py-1
      pl-6
      pr-6
      rounded
      outline-none
      form-control-ring
      form-control-bg
      transition-all duration-200
      {active ? 'bg-primary-500 text-white' : ''}"
    />
    {#if active}
      <div transition:fade={{ duration: 150 }} class="absolute right-0 top-0 flex items-center justify-center" style="width: 24px; height: 24px;">
        <div
          on:click={clearSearch}
          on:keypress={clearSearch}
          class="
          text-sm
          fa-solid fa-times
          rounded-full cursor-pointer 
          flex items-center justify-center 
          opacity-50 hover:opacity-70 active:opacity-100 
          text-white"
          style="width: 14px; height: 14px;"
        />
      </div>
    {/if}
  </div>
</div>
