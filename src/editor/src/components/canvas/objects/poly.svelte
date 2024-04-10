<script>
  import { afterUpdate, onMount } from 'svelte'
  import * as utilities from 'Editor/scripts/utilities'
  import { getters } from 'Editor/store'
  import { activeArtboard, showMouseoverStylesInEditor } from 'Editor/store/ui'
  import PolyRenderer from 'Client/UI/objects/poly'

  export let settings
  export let tempSettings
  export let cursor

  let root
  let style = ''
  let renderer
  let element
  let imageBackground

  $: renderSettings = utilities.deepExtend({}, settings, tempSettings)
  $: settings, (tempSettings = {})

  onMount(() => {
    renderer = new PolyRenderer(renderSettings, {
      state: {
        objectConfig: {
          pageload_animation: 'none',
          glowing_objects: 0,
        },
      },
      getID: () => 0,
      getArtboard: () => getters.getObject($activeArtboard),
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

    renderer.options = modifiedSettings
    element = renderer.createElement()

    // Set styles
    style = renderer.createCSSRules(modifiedSettings.default_style)
    root.style.cursor = cursor

    // Append
    if (root.lastChild) root.removeChild(root.lastChild)
    root.appendChild(element)

    // Image background
    if (imageBackground.lastChild) imageBackground.removeChild(imageBackground.lastChild)
    imageBackground.appendChild(renderer.createImageBackgroundElement())
  }
</script>

<div bind:this={root} {style} class="absolute" data-canvas-object-id={settings.id} />
<div class="z-0 pointer-events-none" bind:this={imageBackground} />
