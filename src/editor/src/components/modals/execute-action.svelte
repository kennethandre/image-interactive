<script>
  import * as consts from 'Editor/scripts/consts'
  import { store } from 'Editor/store'
  import Modal from 'Editor/components/UI/modal'
  import FormControl from 'Editor/components/UI/form-controls/form-control'
  import { onMount, onDestroy } from 'svelte'

  let modal
  let action

  onMount(() => {
    createEvents()
  })
  onDestroy(() => {
    removeEvents()
  })

  function createEvents() {
    document.addEventListener(consts.EVENT_EXECUTE_ACTION_MODAL, handleOpenEvent)
  }
  function removeEvents() {
    document.removeEventListener(consts.EVENT_EXECUTE_ACTION_MODAL, handleOpenEvent)
  }
  function handleOpenEvent() {
    modal.show()
  }
  function handleConfirm() {
    let parsed = JSON.parse(action)
    console.log(parsed)
    store.dispatch(parsed)
    return true
  }
</script>

<Modal bind:this={modal} primaryButton="Execute" cancelButton="Close" onConfirm={handleConfirm} title="Execute Action">
  <div class="p-3">
    <FormControl type="textarea" label="Action JSON" bind:value={action} />
  </div>
</Modal>
