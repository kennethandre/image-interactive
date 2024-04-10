<script>
  import { getters } from 'Editor/store'
  import * as consts from 'Editor/scripts/consts'
  import { exportSettings } from 'Editor/scripts/export'
  import Modal from 'Editor/components/UI/modal'
  import FormControl from 'Editor/components/UI/form-controls/form-control'
  import { onMount, onDestroy } from 'svelte'

  let modal
  let code

  onMount(() => {
    createEvents()
  })
  onDestroy(() => {
    removeEvents()
  })

  function createEvents() {
    document.addEventListener(consts.EVENT_OPEN_EXPORT_MODAL, handleOpenEvent)
  }
  function removeEvents() {
    document.removeEventListener(consts.EVENT_OPEN_EXPORT_MODAL, handleOpenEvent)
  }
  function handleOpenEvent() {
    code = JSON.stringify(exportSettings(getters.getSettings()))
    modal.show()
  }
</script>

<Modal bind:this={modal} cancelButton="Close" title="Export Image Map">
  <div class="p-3">
    <FormControl type="textarea" label="Exported JSON" bind:value={code} />
  </div>
</Modal>
