<script>
  import * as consts from 'Editor/scripts/consts'
  import Modal from 'Editor/components/UI/modal'
  import FormControl from 'Editor/components/UI/form-controls/form-control'
  import { onMount, onDestroy } from 'svelte'
  import { clear, lockSize, activeArtboard } from 'Editor/store/ui'
  import { importSettings } from 'Editor/scripts/import'
  import { getters, setters } from 'Editor/store'
  import * as utilities from 'Editor/scripts/utilities'
  import * as defaults from 'Client/scripts/defaults'
  import { SVGImport } from 'Editor/scripts/svg-import'
  import { demos } from 'Editor/scripts/demo-templates'

  let modal
  let defaultName = 'Untitled'
  let name = defaultName
  let type = 'blank'
  let typeOptions = [
    {
      name: 'Blank',
      value: 'blank',
    },
    {
      name: 'Country',
      value: 'country',
    },
    {
      name: 'Demos',
      value: 'demos',
    },
  ]
  let country
  let countries
  let demo

  onMount(() => {
    createEvents()
  })
  onDestroy(() => {
    removeEvents()
  })

  function createEvents() {
    document.addEventListener(consts.EVENT_OPEN_NEW_MAP_MODAL, handleOpenEvent)
  }
  function removeEvents() {
    document.removeEventListener(consts.EVENT_OPEN_NEW_MAP_MODAL, handleOpenEvent)
  }
  function handleOpenEvent() {
    name = defaultName

    fetch('https://dfpyxk7hlnlki.cloudfront.net/countries.json')
      .then((res) => res.json())
      .then((body) => {
        countries = body
        country = 'united-states'
      })
      .catch((err) => console.log(err))

    modal.show()
  }
  function onConfirm() {
    if (type === 'country') {
      fetch(`https://dfpyxk7hlnlki.cloudfront.net/countries/${country}.svg`)
        .then((res) => res.text())
        .then((svg) => {
          createMap()
          importCountry(svg)
          setters.clearHistory()
          modal.hide()
        })
        .catch((err) => console.log(err))
    } else if (type === 'demos') {
      importDemo()
      setters.clearHistory()
      modal.hide()
    } else {
      createMap()
      setters.clearHistory()
      modal.hide()
    }
  }
  function createMap() {
    // Create new map
    clear()
    let newSettings = importSettings(defaults.imageMapDefaults)
    newSettings.id = utilities.uuidv4()
    newSettings.general.name = name || 'Untitled'
    $activeArtboard = newSettings.artboards[0].id
    setters.setMapValues(newSettings, true)
  }
  function importCountry(svg) {
    // Import country
    let artboardWidth = getters.getValue({ group: 'activeArtboard', prop: 'width' })
    let artboardHeight = getters.getValue({ group: 'activeArtboard', prop: 'height' })
    let importedObject = SVGImport(svg, artboardWidth, artboardHeight)
    let importedObjectsRect = utilities.calcBoundingRectForObjects([importedObject], { width: artboardWidth, height: artboardHeight })

    // Resize canvas to object size
    let newWidth = artboardWidth * (importedObjectsRect.width / 100)
    let newHeight = artboardHeight * (importedObjectsRect.height / 100)
    $lockSize = false
    setters.setValue({ group: 'activeArtboard', prop: 'width', value: newWidth })
    setters.setValue({ group: 'activeArtboard', prop: 'height', value: newHeight })
    $lockSize = true

    // Set tooltips to sticky
    setters.setValue({ group: 'tooltips', prop: 'sticky_tooltips', value: true })

    // Re-import the object with the new canvas ratio
    let importedObjectAfterResize = SVGImport(svg, newWidth, newHeight)

    setters.insertObjects({ objects: [importedObjectAfterResize] })

    // Set some styles for all objects
    let allObjects = getters.getAllObjects()
    let values = {}
    let i = 0
    for (let obj of allObjects) {
      values[obj.id] = {
        default_style: {
          background_color: '#000000',
          background_opacity: 0.5,
          stroke_width: 1,
          stroke_color: '#ffffff',
        },
        mouseover_style: {
          background_color: '#d97706',
          background_opacity: 1,
          stroke_width: 1,
          stroke_color: '#ffffff',
        },
        tooltip_content: [
          {
            type: 'Heading',
            text: obj.title,
            heading: 'h3',
            other: {
              id: '',
              classes: '',
              css: '',
            },
            style: {
              fontFamily: 'sans-serif',
              fontSize: 20.8,
              lineHeight: 'normal',
              color: '#ffffff',
              textAlign: 'left',
            },
            boxModel: {
              width: 'auto',
              height: 'auto',
              margin: {
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
              },
              padding: {
                top: 10,
                bottom: 10,
                left: 10,
                right: 10,
              },
            },
            id: utilities.uuidv4(),
          },
        ],
      }

      values[obj.id].default_style = utilities.deepExtend({}, defaults.objectDefaults.default_style, values[obj.id].default_style)
      values[obj.id].mouseover_style = utilities.deepExtend({}, defaults.objectDefaults.mouseover_style, values[obj.id].mouseover_style)

      // Skip the artboard object and the main group
      // and make each group a single object
      if (i > 1 && obj.type === consts.OBJECT_GROUP) {
        values[obj.id].single_object = true
      }

      i++
    }
    setters.setObjectValues(values)
  }
  function importDemo() {
    clear()
    let newSettings = importSettings(demo)
    newSettings.id = utilities.uuidv4()
    newSettings.general.name = name || 'Untitled'
    $activeArtboard = newSettings.artboards[0].id
    setters.setMapValues(newSettings, true)
  }
</script>

<Modal bind:this={modal} cancelButton="Cancel" primaryButton="Create" {onConfirm} title="New Image Map">
  <div class="p-3">
    <div class="flex items-center mb-2">
      <div class="pr-1 text-xs basis-[120px]">Name:</div>
      <div class="flex-1"><FormControl type="text" bind:value={name} /></div>
    </div>
    <div class="flex items-center mb-2">
      <div class="pr-1 text-xs basis-[120px]">Template:</div>
      <div class="flex-1"><FormControl type="button-group" options={typeOptions} bind:value={type} /></div>
    </div>

    {#if type === 'country'}
      <div class="flex items-center mb-2">
        <div class="pr-1 text-xs basis-[120px]">Choose Country:</div>
        <div class="flex-1"><FormControl type="select" options={countries} bind:value={country} /></div>
      </div>
    {/if}
    {#if type === 'demos'}
      <div class="flex items-center mb-2">
        <div class="pr-1 text-xs basis-[120px]">Choose Demo:</div>
        <div class="flex-1"><FormControl type="select" options={demos} bind:value={demo} /></div>
      </div>
    {/if}
  </div>
</Modal>
