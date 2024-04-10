<script>
  import { beforeUpdate } from 'svelte'

  export let value
  export let onChange = () => {}
  export let onUpdate = () => {}

  beforeUpdate(() => {
    if (!value) value = '#000000'
  })
</script>

<div class="flex flex-col items-center">
  <input
    type="color"
    bind:value
    on:input={onUpdate}
    on:change={onChange}
    style="height: 24px;"
    class="
      block
      rounded
      w-full
      outline-none
      form-control-ring
      form-control-border
      bg-transparent
      focus:border-primary-500
      focus:bg-primary-500
      transition-all duration-200"
  />
</div>

<style>
  ::-webkit-color-swatch-wrapper {
    padding: 0;
    border-radius: 5px;
  }

  ::-webkit-color-swatch {
    padding: 0;
    margin: 0;
    border: 0;
    border-radius: 0.2rem;
  }

  ::-moz-color-swatch,
  ::-moz-focus-inner {
    border: 0;
  }

  ::-moz-focus-inner {
    padding: 0;
  }
</style>
