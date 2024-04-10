<script>
  import { getters, setters, store } from 'Editor/store'
  import { objectDefaults } from 'Client/scripts/defaults'
  import * as consts from 'Editor/scripts/consts'
  import * as utilities from 'Editor/scripts/utilities'
  import Modal from 'Editor/components/UI/modal'
  import { onMount, onDestroy } from 'svelte'
  import JSONEditor from 'Editor/components/json-editor/json-editor'

  let subscribers = []
  let modal
  let defaults = objectDefaults
  let model = utilities.deepExtend({}, defaults, getters.getValue({ group: 'defaults', prop: 'objectDefaults' }))

  subscribers.push(
    store.subscribe(() => {
      model = utilities.deepExtend({}, defaults, getters.getValue({ group: 'defaults', prop: 'objectDefaults' }))
    })
  )

  onMount(() => {
    createEvents()
  })
  onDestroy(() => {
    subscribers.forEach((unsub) => unsub())
    subscribers = []
    removeEvents()
  })

  function createEvents() {
    document.addEventListener(consts.EVENT_OPEN_OBJECT_DEFAULTS_MODAL, handleOpenEvent)
  }
  function removeEvents() {
    document.removeEventListener(consts.EVENT_OPEN_OBJECT_DEFAULTS_MODAL, handleOpenEvent)
  }
  function handleOpenEvent() {
    modal.show()
  }
  function handleOnChange() {
    let value = utilities.clean(utilities.subtract(model, defaults)) || {}
    setters.setValue({
      group: 'defaults',
      prop: 'objectDefaults',
      value,
    })
  }
</script>

<Modal bind:this={modal} width="550" cancelButton="Done">
  <div class="p-4 h-full">
    <div class="p-4 h-full bg-theme-100 dark:bg-theme-700 dark:bg-opacity-50 rounded">
      <div class="h-full pretty-scroll overflow-auto pl-2">
        <JSONEditor onChange={handleOnChange} {defaults} bind:model title="Object Defaults" />
      </div>
    </div>
  </div>
</Modal>
