<script>
  import { afterUpdate, onMount } from 'svelte'
  import { getters } from 'Editor/store'
  import { zoom, showMouseoverStylesInEditor } from 'Editor/store/ui'
  import * as utilities from 'Editor/scripts/utilities'
  import SpotRenderer from 'Client/UI/objects/spot'

  export let settings
  export let tempSettings
  export let cursor

  let root
  let renderer
  let element

  $: renderSettings = utilities.deepExtend({}, settings, tempSettings)
  $: settings, (tempSettings = {})

  onMount(() => {
    renderer = new SpotRenderer(renderSettings, {
      state: {
        objectConfig: {
          pageload_animation: 'none',
          glowing_objects: 0,
        },
      },
      getID: () => 0,
      getZoom: () => 1,
      getObject: () => {
        return {}
      },
    })

    element = renderer.createElement()
    root.appendChild(element)
  })

  afterUpdate(() => {
    redraw()
  })

  export function redraw() {
    let modifiedSettings = utilities.deepExtend({}, renderSettings)
    if ($showMouseoverStylesInEditor) modifiedSettings.default_style = modifiedSettings.mouseover_style

    if (!getters.getSettings().objectConfig.scale_spots) {
      modifiedSettings.default_style.icon_size = renderSettings.default_style.icon_size * $zoom
    }

    renderer.options = modifiedSettings
    element = renderer.createElement()

    // Generate and apply CSS
    let css = renderer.createCSSRules(modifiedSettings.default_style)
    element.setAttribute('style', css)

    // Modify CSS for the editor
    element.classList.value = ''
    element.style.position = 'absolute'
    element.style.display = 'flex'
    element.style.justifyContent = 'center'
    element.style.alignItems = 'center'
    element.style.cursor = cursor

    // Append to DOM
    if (root.lastChild) root.removeChild(root.lastChild)
    root.appendChild(element)
  }
</script>

<div bind:this={root} data-canvas-object-id={settings.id} />
