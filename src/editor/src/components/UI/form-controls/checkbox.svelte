<script>
  export let value
  export let name = ''
  export let onChange = () => {}
</script>

<label class="flex items-center select-none cursor-pointer" style="height: 24px;">
  <input type="checkbox" class="checkbox form-control-border mr-0.5" bind:checked={value} on:change={onChange} />
  <span class="h-full flex items-center ml-1" style="padding-top: 1px;">{name}</span>
</label>
