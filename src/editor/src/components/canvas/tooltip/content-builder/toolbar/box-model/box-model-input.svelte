<script>
  export let onChange = () => {}
  export let value

  let contentOnFocus = ''

  function onFocus() {
    contentOnFocus = value
  }
  function onFocusOut() {
    if (value !== contentOnFocus) onChange()
  }
</script>

<div contenteditable="true" class="px-1 flex items-center justify-center" bind:innerHTML={value} style="outline: 0px solid transparent" on:focus={onFocus} on:focusout={onFocusOut} />
