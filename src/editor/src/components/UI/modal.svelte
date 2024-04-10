<script>
  import { fly, fade } from 'svelte/transition'
  import * as utilities from 'Editor/scripts/utilities'
  import * as consts from 'Editor/scripts/consts'
  import { onDestroy, onMount } from 'svelte'
  import FormControl from 'Editor/components/UI/form-controls/form-control'

  export let title = ''
  export let primaryButton
  export let cancelButton
  export let dangerButton
  export let onConfirm = () => {} // must return "true" for the modal to close!
  export let onCancel = () => {}
  export let width = 400

  export function show() {
    visible = true
  }
  export function hide() {
    visible = false
  }

  let id = utilities.uuidv4()
  let visible = false
  let eventStartedInModal = false

  onMount(() => {
    createEvents()
  })
  onDestroy(() => {
    hide()
    removeEvents()
  })

  function createEvents() {
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener(consts.SHORTCUT_ENTER, handleEnter)
    document.addEventListener(consts.SHORTCUT_ESC, handleEsc)
  }
  function removeEvents() {
    document.removeEventListener('mousedown', handleMouseDown)
    document.removeEventListener('mouseup', handleMouseUp)
    document.removeEventListener(consts.SHORTCUT_ENTER, handleEnter)
    document.removeEventListener(consts.SHORTCUT_ESC, handleEsc)
  }

  function handleMouseDown(e) {
    eventStartedInModal = e.target.closest(`[data-id="${id}"]`) ? true : false
  }
  function handleMouseUp(e) {
    if (visible && !e.target.closest(`[data-id="${id}"]`) && !eventStartedInModal) {
      visible = false
      onCancel()
    }
  }
  function handleEnter() {
    if (visible && onConfirm()) visible = false
  }
  function handleEsc() {
    if (visible) {
      visible = false
      onCancel()
    }
  }
  function onCancelLocal() {
    if (visible) {
      visible = false
      onCancel()
    }
  }
  function onConfirmLocal() {
    if (visible && onConfirm()) visible = false
  }
  export function getId() {
    return id
  }
</script>

{#if visible}
  <div transition:fade={{ duration: 250 }} class="fixed w-full h-full bg-white dark:bg-black bg-opacity-60 dark:bg-opacity-60 flex flex-col justify-start items-center py-10" style="z-index: 99999">
    <div class="flex flex-col ui rounded-md min-h-0" data-id={id} transition:fly={{ y: -25, duration: 250 }} style="width: {width}px;">
      {#if title}
        <div class="p-4 border-b border-theme-100 dark:border-theme-700 font-bold text-theme-800 dark:text-theme-100 text-sm">{title}</div>
      {/if}
      <div class="flex-1 min-h-0">
        <slot />
      </div>
      {#if cancelButton || primaryButton || dangerButton}
        <div class="p-2 flex justify-end">
          {#if cancelButton}
            <FormControl type="button" name={cancelButton} action={onCancelLocal} />
          {/if}
          {#if primaryButton}
            <FormControl type="button" primary name={primaryButton} action={onConfirmLocal} />
          {/if}
          {#if dangerButton}
            <FormControl type="button" danger name={dangerButton} action={onConfirmLocal} />
          {/if}
        </div>
      {/if}
    </div>
  </div>
{/if}
