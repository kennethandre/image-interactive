<script>
  import { getters } from 'Editor/store'
  import * as consts from 'Editor/scripts/consts'
  import { exportSettings } from 'Editor/scripts/export'
  import Modal from 'Editor/components/UI/modal'
  import FormControl from 'Editor/components/UI/form-controls/form-control'
  import { onMount, onDestroy } from 'svelte'

  let modal
  let htmlCode = `<div id="image-map-pro"></div>`
  let JSCode
  let JSImportCode = '<script src="image-map-pro.min.js"></script'
  JSImportCode += '>'

  onMount(() => {
    createEvents()
  })
  onDestroy(() => {
    removeEvents()
  })

  function createEvents() {
    document.addEventListener(consts.EVENT_OPEN_PUBLISH_MODAL, handleOpenEvent)
  }
  function removeEvents() {
    document.removeEventListener(consts.EVENT_OPEN_PUBLISH_MODAL, handleOpenEvent)
  }
  function handleOpenEvent() {
    const exported = JSON.stringify(exportSettings(getters.getSettings()))
    JSCode = `<script>ImageMapPro.init('#image-map-pro', ${exported})`
    JSCode += '</s'
    JSCode += 'cript>'
    modal.show()
  }
  function selectTextarea(e) {
    if (e.target.tagName === 'TEXTAREA') {
      e.target.select()
    } else {
      e.target.querySelector('textarea').select()
    }
  }
</script>

<Modal bind:this={modal} cancelButton="Close" title="Publish Image Map" width="600">
  <div class="p-3">
    <p class="p-2">1. Paste this HTML code in your page, where you want the image map to appear.</p>
    <div class="bg-theme-400 bg-opacity-10 p-4 m-1 text-xs rounded-md font-mono">{htmlCode}</div>

    <p class="p-2 mt-4">2. Include the main Image Map Pro script file just before the closing body tag.</p>
    <div class="bg-theme-400 bg-opacity-10 p-4 m-1 text-xs rounded-md font-mono">{JSImportCode}</div>

    <p class="p-2 mt-4">3. Paste this code below the included script.</p>
    <div class="font-mono" on:click={selectTextarea} on:keypress={selectTextarea}>
      <FormControl type="textarea" bind:value={JSCode} />
    </div>
  </div>
</Modal>
