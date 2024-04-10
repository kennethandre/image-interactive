<script>
  import JsonEditorProp from 'Editor/components/json-editor/json-editor-prop'
  import * as utils from 'Editor/scripts/utilities'
  import { afterUpdate } from 'svelte'
  import { slide } from 'svelte/transition'

  export let name
  export let value
  export let defaults
  export let onChange = () => {}
  export let searchString
  export let hideUnchanged
  export let isRoot

  let hasChanges = false
  let collapsed = false
  let nameElement
  let restoreButton

  $: iconClass = collapsed ? 'fa-plus' : 'fa-minus'

  afterUpdate(() => {
    checkForChanges()
  })

  function onPropChange(n, v) {
    value[n] = v
    checkForChanges()
    onChange(name, value)
  }
  function checkForChanges() {
    if (utils.clean(utils.subtract(value, defaults)) !== undefined) {
      hasChanges = true
      setChangedStyle()
    } else {
      hasChanges = false
      setUnchangedStyle()
    }
  }
  function setChangedStyle() {
    nameElement?.classList.add('font-extrabold')
    nameElement?.classList.add('underline')
    restoreButton?.classList.remove('hidden')
  }
  function setUnchangedStyle() {
    nameElement?.classList.remove('font-extrabold')
    nameElement?.classList.remove('underline')
    restoreButton?.classList.add('hidden')
  }
  function restoreDefault() {
    value = utils.deepExtend({}, defaults)
    setUnchangedStyle()
    onChange(name, value)
  }
</script>

{#if (hideUnchanged && hasChanges) || !hideUnchanged || isRoot}
  <div class="relative">
    <!-- Line -->
    <div class="absolute -left-4 top-0 h-full pt-9">
      <div class="w-px bg-theme-200 dark:bg-theme-700 h-full" />
    </div>
    <!-- Title -->
    <div class="py-2 flex items-center select-none">
      <!-- Icon -->
      <div class="absolute -left-5 top-3 fa-solid {iconClass} cursor-pointer opacity-50 hover:opacity-100" on:click={() => (collapsed = !collapsed)} on:keypress={() => (collapsed = !collapsed)} />
      <!-- Text -->
      <div bind:this={nameElement}>{name}</div>
      <!-- Restore button -->
      <div class="fa-solid fa-undo ml-2 cursor-pointer" on:click={restoreDefault} on:keypress={restoreDefault} bind:this={restoreButton} />
      <!-- Slot for extra button -->
      <slot name="extra-button" />
    </div>
    <!-- Children -->
    {#if !collapsed}
      <div class="pl-4" transition:slide={{ duration: 150 }}>
        <!-- Iterate over children -->
        {#each Object.entries(value) as entry (entry[0])}
          {#if typeof entry[1] === 'object' && !Array.isArray(entry[1]) && entry[1] !== null}
            <!-- Nested object -->
            <svelte:self name={entry[0]} value={entry[1]} defaults={defaults[entry[0]]} onChange={onPropChange} {searchString} {hideUnchanged} />
          {/if}
          {#if (typeof entry[1] !== 'object' || Array.isArray(entry[1])) && entry[1] !== null}
            <!-- Flat value -->
            <JsonEditorProp name={entry[0]} value={entry[1]} defaultValue={defaults[entry[0]]} onChange={onPropChange} {searchString} {hideUnchanged} />
          {/if}
        {/each}
      </div>
    {/if}
  </div>
{/if}
