<script>
  import { onMount, onDestroy } from 'svelte'
  import * as consts from 'Editor/scripts/consts'
  import * as utilities from 'Editor/scripts/utilities'
  import { importSettings } from 'Editor/scripts/import'
  import { getSaves, deleteSave, setLastSave } from 'Editor/scripts/storage'
  import { setters } from 'Editor/store'
  import { clear } from 'Editor/store/ui'
  import Modal from 'Editor/components/UI/modal'
  import FormControl from 'Editor/components/UI/form-controls/form-control'

  let modal
  let saves = []
  let loading = false
  let deleteConfirm
  let deleteLoading

  onMount(() => {
    createEvents()
  })
  onDestroy(() => {
    removeEvents()
  })

  function createEvents() {
    document.addEventListener(consts.EVENT_OPEN_LOAD_MODAL, handleOpenEvent)
  }
  function removeEvents() {
    document.removeEventListener(consts.EVENT_OPEN_LOAD_MODAL, handleOpenEvent)
  }
  function handleOpenEvent() {
    loading = true
    getSaves((data) => {
      saves = data
      saves = saves.sort((a, b) => (parseInt(a.lastSaved) > parseInt(b.lastSaved) ? -1 : 1))
      loading = false
    })
    modal.show()
  }
  function onDelete(e) {
    let id = e.target.dataset.id || e.target.closest('[data-id]').dataset.id
    deleteConfirm = id
  }
  function onLoad(e) {
    clear()

    let id = e.target.dataset.id || e.target.closest('[data-id]').dataset.id
    let save = saves.filter((o) => o.id + '' === id + '')[0]

    let imported = importSettings(save)
    setters.setMapValues(imported, true)
    setLastSave(id)
    setters.clearHistory()

    modal.hide()
  }
  function onConfirmDelete(e) {
    let id = e.target.dataset.id || e.target.closest('[data-id]').dataset.id
    deleteConfirm = undefined
    deleteLoading = id

    deleteSave(id, () => {
      getSaves((data) => {
        saves = data
        saves = saves.sort((a, b) => (parseInt(a.lastSaved) > parseInt(b.lastSaved) ? -1 : 1))
        deleteConfirm = undefined
        deleteLoading = undefined
      })
    })
  }
  function onCancelDelete() {
    deleteConfirm = undefined
  }
</script>

<Modal bind:this={modal} cancelButton="Close" title="Load">
  {#if !loading}
    <div class="p-3 max-h-[400px] overflow-y-auto">
      {#if !saves || saves.length === 0}
        <div class="px-3 py-2 rounded-lg bg-danger-500 bg-opacity-10">No saved image maps found.</div>
      {/if}
      {#each saves as save, index (save.id)}
        <div class="my-1 flex items-center rounded-xl bg-theme-500 bg-opacity-10">
          <div class="flex-1 flex items-center p-3 rounded-l-lg cursor-pointer btn btn-transparent" on:click={onLoad} on:keypress={onLoad} data-id={save.id}>
            <div class="flex-1">{save.general.name}</div>
            <div class="ml-2 opacity-50">Last edit: {utilities.timeSince(save.lastSaved || new Date().getTime())} ago</div>
          </div>
          <div class="mx-2 flex">
            {#if deleteConfirm + '' !== save.id + '' && deleteLoading + '' !== save.id + ''}
              <FormControl type="button" icon="fa-solid fa-trash" action={onDelete} id={save.id} />
            {/if}
            {#if deleteConfirm + '' === save.id + ''}
              <FormControl type="button" icon="fa-solid fa-times" action={onCancelDelete} id={save.id} />
              <FormControl type="button" danger icon="fa-solid fa-check" action={onConfirmDelete} id={save.id} />
            {/if}
            {#if deleteLoading + '' === save.id + ''}
              <div class="fa-solid fa-circle-notch fa-spin flex items-center px-3" />
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <div class="p-4">Loading...</div>
  {/if}
</Modal>
