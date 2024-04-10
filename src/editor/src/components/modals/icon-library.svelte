<script>
  import { setters } from 'Editor/store'
  import * as consts from 'Editor/scripts/consts'
  import Modal from 'Editor/components/UI/modal'
  import { onMount, onDestroy } from 'svelte'
  import IconLibrary from 'Editor/components/icon-library'

  let modal
  let icon

  onMount(() => {
    createEvents()
  })
  onDestroy(() => {
    removeEvents()
  })

  function createEvents() {
    document.addEventListener(consts.EVENT_OPEN_ICON_LIBRARY_MODAL, handleOpenEvent)
  }
  function removeEvents() {
    document.removeEventListener(consts.EVENT_OPEN_ICON_LIBRARY_MODAL, handleOpenEvent)
  }
  function handleOpenEvent() {
    modal.show()
  }
  function chooseIcon() {
    setters.setValue({
      group: 'selected',
      prop: 'default_style.icon_svg',
      value: icon,
    })
    modal.hide()
  }
</script>

<Modal bind:this={modal} width="550" title="Choose Icon" cancelButton="Cancel">
  <div class="p-2 h-full">
    <IconLibrary onChange={chooseIcon} bind:value={icon} />
  </div>
</Modal>
