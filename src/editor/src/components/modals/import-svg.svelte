<script>
  import * as consts from 'Editor/scripts/consts'
  import Modal from 'Editor/components/UI/modal'
  import FormControl from 'Editor/components/UI/form-controls/form-control'
  import { onMount, onDestroy } from 'svelte'
  import { SVGImport, SVGImportAsSingle } from 'Editor/scripts/svg-import'
  import { setters, getters } from 'Editor/store'

  let modal
  let error
  let importAsMultipleObjects = true
  let resizeOption = 'none'
  let code = ''

  onMount(() => {
    createEvents()
  })
  onDestroy(() => {
    removeEvents()
  })

  function createEvents() {
    document.addEventListener(consts.EVENT_OPEN_SVG_IMPORT_MODAL, handleOpenEvent)
  }
  function removeEvents() {
    document.removeEventListener(consts.EVENT_OPEN_SVG_IMPORT_MODAL, handleOpenEvent)
  }
  function handleOpenEvent() {
    modal.show()
  }

  function onConfirm() {
    error = ''

    if (code.length > 0) {
      try {
        let canvasWidth = getters.getValue({ group: 'activeArtboard', prop: 'width' })
        let canvasHeight = getters.getValue({ group: 'activeArtboard', prop: 'height' })

        let object = importAsMultipleObjects ? SVGImport(code, canvasWidth, canvasHeight) : SVGImportAsSingle(code, canvasWidth, canvasHeight)

        setters.insertObjects({ objects: [object] })
        code = ''
      } catch (err) {
        console.log(err)
        error = 'There was an error parsing the XML. Please make sure it is valid XML code: <a href="https://www.xmlvalidation.com/" target="_blank">xmlvalidator.com</a>'
        code = ''
        return false
      }
    }

    return true
  }
</script>

<Modal primaryButton="Import" {onConfirm} cancelButton="Cancel" bind:this={modal} width="500">
  <div class="p-2">
    <FormControl type="textarea" label="SVG Code" bind:value={code} />
    <div class="bg-theme-400 bg-opacity-10 p-4 m-1 text-xs rounded-md">If you are looking to apply SVG as a background of the whole map, it is better to export it as PNG and apply it as a background from the Artboard settings.</div>
    <FormControl
      type="checkbox"
      name="Import as multiple objects"
      bind:value={importAsMultipleObjects}
      description="When importing as <strong>multiple</strong> objects, you will be able to move and scale each object, and apply styles like stroke and fill. However, some data may be lost. Matrix transforms, stylesheets, defs, filters and others are not supported at this time. <br><br>When importing as a <strong>single</strong> object, the SVG will be exactly the same, but will not be editable, except for applying filters to it. If you absolutely need to preserve all properties of multiple objects, you need to export each object as a separate SVG."
    />
    <div class="bg-danger-500 bg-opacity-10 p-4 m-1 text-xs rounded-md">
      For optimal results we recommended that you export from <strong>Figma</strong> (browser/Mac/Win, free trial) or <strong>Sketch</strong> (Mac only, free trial).
    </div>
    <!-- <FormControl type="checkbox" name="Resize image map to object size" bind:value={resizeImageMap} /> -->
    <!-- <div class="mt-2" />
    <FormControl
      type="button-group"
      options={[
        { name: "Don't Change Anything", value: 'none' },
        { name: 'Resize Artboard to Object', value: 'fit-canvas' },
        { name: 'Fit Object in Artboard', value: 'fit-object' },
      ]}
      bind:value={resizeOption}
    /> -->
    {#if error}
      <div class="m-1 p-3 rounded bg-danger-500 bg-opacity-10 text-sm" bind:innerHTML={error} contenteditable="false" />
    {/if}
  </div>
</Modal>
