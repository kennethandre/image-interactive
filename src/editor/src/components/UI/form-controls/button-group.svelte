<script>
  import { onMount, afterUpdate } from 'svelte'
  export let value
  export let options
  export let onChange = () => {}

  let root

  function setValue(e) {
    value = e.target.dataset.value
    onChange()
  }
</script>

<div class="flex flex-col items-center">
  <div class="flex w-full form-control-bg rounded" bind:this={root}>
    {#each options as option (option.name)}
      <div
        class="btn-group-btn
        flex-grow
        flex
        justify-center
        items-center
        cursor-pointer
        rounded
        transition-all
        duration-100
        {value == option.value ? 'btn-group-selected' : ''}
        "
        style="height: 24px;"
        data-value={option.value}
        on:click={setValue}
        on:keypress={setValue}
      >
        {option.name}
      </div>
    {/each}
  </div>
</div>
