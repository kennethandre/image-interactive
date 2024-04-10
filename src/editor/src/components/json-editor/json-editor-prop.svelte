<script>
  import * as utilities from 'Editor/scripts/utilities'
  import { afterUpdate } from 'svelte'
  export let name
  export let value
  export let onChange = () => {}
  export let defaultValue
  export let searchString
  export let hideUnchanged

  let root
  let nameElement
  let restoreButton
  let valueBeforeFocusOut = value
  let hasChanges

  $: opacity = Array.isArray(value) ? 0.5 : 1

  afterUpdate(() => {
    checkForChanges()
  })

  function onFocusOut() {
    if (value != valueBeforeFocusOut) {
      valueBeforeFocusOut = value

      parseValue()
      checkForChanges()
      onChange(name, value)
    }
  }

  function checkForChanges() {
    if (JSON.stringify(value) !== JSON.stringify(defaultValue)) {
      hasChanges = true
      setChangedStyle()
    } else {
      hasChanges = false
      setUnchangedStyle()
    }
  }

  function restoreDefault() {
    value = defaultValue
    parseValue()
    setUnchangedStyle()
    onChange(name, value)
  }

  function setChangedStyle() {
    root?.classList.add('font-extrabold')
    nameElement?.classList.add('underline')
    restoreButton?.classList.remove('hidden')
  }

  function setUnchangedStyle() {
    root?.classList.remove('font-extrabold')
    nameElement?.classList.remove('underline')
    restoreButton?.classList.add('hidden')
  }

  function parseValue() {
    // Strip tags
    if (value.replace) {
      value = value.replace(/<\/?[^>]+(>|$)/g, '')
    }

    // Parse number
    if (utilities.isNumber(value)) {
      value = parseFloat(value)
    }
  }
</script>

{#if searchString.length === 0 || (searchString.length > 0 && name.search(searchString) !== -1)}
  {#if (hideUnchanged && hasChanges) || !hideUnchanged}
    <div class="flex select-none items-center py-1" style="opacity: {opacity};" bind:this={root}>
      <!-- Title -->
      <div bind:this={nameElement}>{name}</div>
      <div class="mx-2">:</div>
      <!-- Value -->
      {#if !Array.isArray(value)}
        <div
          class="
          form-control-ring
          form-control-bg
          transition-all
          duration-200
          px-2
          py-1
          rounded
          text-right"
          contenteditable="true"
          bind:innerHTML={value}
          on:focusout={onFocusOut}
          style="outline: 0px solid transparent"
        />
      {/if}
      <!-- Value (Array) -->
      {#if Array.isArray(value)}
        <div class="bg-theme-200 dark:bg-theme-600 px-2 py-1 rounded text-right">{JSON.stringify(value)}</div>
      {/if}
      <!-- Restore button -->
      <div class="fa-solid fa-undo ml-2 cursor-pointer" on:click={restoreDefault} on:keypress={restoreDefault} bind:this={restoreButton} />
    </div>
  {/if}
{/if}
