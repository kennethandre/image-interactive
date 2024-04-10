<script>
  export let onChange = () => {}
  export let onUpdate = () => {}
  export let placeholder
  export let attachment = ''
  export let value = ''
  export let hasError = false

  $: _v = parseString(value).replace(attachment, '') || ''

  function parseString(v) {
    if (v !== undefined) return v + ''
    return ''
  }
  function _onChange() {
    value = _v + attachment
    onChange()
  }
  function _onUpdate() {
    value = _v + attachment
    onUpdate()
  }
</script>

<div class="flex flex-col items-center">
  <div class="flex w-full">
    <input
      type="text"
      bind:value={_v}
      on:keyup={_onUpdate}
      on:change={_onChange}
      {placeholder}
      style="height: 24px;"
      class="
    w-full
    p-1
    px-1.5
    {attachment ? 'rounded rounded-r-none' : 'rounded'}
    outline-none
    {hasError ? 'form-control-ring-error' : 'form-control-ring'}
    {hasError ? 'form-control-bg-error' : 'form-control-bg'}
    transition-all duration-200"
    />
    {#if attachment}
      <div class="rounded rounded-l-none form-control-bg ml-0.5 px-1 flex items-center">{attachment}</div>
    {/if}
  </div>
</div>
