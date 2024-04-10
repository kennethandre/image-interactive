<script>
  export let value
  export let onChange = () => {}
  export let onUpdate = () => {}
  export let placeholder
  export let hasError = false
</script>

<div class="flex flex-col items-center">
  <textarea
    rows="4"
    bind:value
    on:keyup={onUpdate}
    on:change={onChange}
    {placeholder}
    class="
  w-full
  p-1.5
  rounded
  outline-none
  {hasError ? 'form-control-ring-error' : 'form-control-ring'}
  {hasError ? 'form-control-bg-error' : 'form-control-bg'}
  transition-all duration-200"
  />
</div>
