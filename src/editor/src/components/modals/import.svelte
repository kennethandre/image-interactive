<script>
  import { slide, fade } from 'svelte/transition'
  import { setters } from 'Editor/store'
  import { clear } from 'Editor/store/ui'
  import * as consts from 'Editor/scripts/consts'
  import { importSettings } from 'Editor/scripts/import'
  import Modal from 'Editor/components/UI/modal'
  import FormControl from 'Editor/components/UI/form-controls/form-control'
  import { onMount, onDestroy } from 'svelte'
  import * as utilities from 'Editor/scripts/utilities'

  let modal
  let code
  let errorText
  let errorTextVisible

  onMount(() => {
    createEvents()
  })
  onDestroy(() => {
    removeEvents()
  })

  function createEvents() {
    document.addEventListener(consts.EVENT_OPEN_IMPORT_MODAL, handleOpenEvent)
  }
  function removeEvents() {
    document.removeEventListener(consts.EVENT_OPEN_IMPORT_MODAL, handleOpenEvent)
  }
  function handleOpenEvent() {
    modal.show()
  }
  function handleConfirm() {
    let parsed

    try {
      parsed = JSON.parse(code)
      errorText = undefined
    } catch (err) {
      errorText = err
    }

    code = ''

    if (parsed) {
      clear()
      let imported = importSettings(parsed)
      imported.id = utilities.uuidv4()
      setters.setMapValues(imported, true)
      setters.clearHistory()
      return true
    } else {
      return false
    }
  }
  function toggleErrorText() {
    errorTextVisible = !errorTextVisible
  }
</script>

<Modal bind:this={modal} primaryButton="Import" cancelButton="Close" onConfirm={handleConfirm} title="Import Image Map">
  <div class="p-3">
    <FormControl type="textarea" label="Exported JSON Code" bind:value={code} />
    {#if errorText}
      <div class="bg-danger-500 bg-opacity-10 p-4 m-1 text-xs rounded-md">
        There was an error importing the code.
        <span class="underline cursor-pointer" on:click={toggleErrorText} on:keypress={toggleErrorText}>Show {errorTextVisible ? 'Less' : 'More...'}</span>
        {#if errorTextVisible}
          <div transition:fade>
            <div class="mt-2 opacity-50 font-mono" transition:slide>
              {errorText}
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</Modal>
