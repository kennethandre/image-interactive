<script>
  import { afterUpdate, onMount } from 'svelte'
  import * as utilities from 'Editor/scripts/utilities'
  import RectRenderer from 'Client/UI/objects/rect'
  import { showMouseoverStylesInEditor } from 'Editor/store/ui'

  export let settings
  export let tempSettings
  export let cursor

  let root
  let renderer
  let element
  let imageBackground

  $: renderSettings = utilities.deepExtend({}, settings, tempSettings)
  $: settings, (tempSettings = {})

  onMount(() => {
    renderer = new RectRenderer(renderSettings, {
      state: {
        objectConfig: {
          pageload_animation: 'none',
          glowing_objects: 0,
        },
      },
      getID: () => 0,
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

    // Generate and apply CSS
    let css = renderer.createCSSRules(modifiedSettings.default_style)
    element.setAttribute('style', css)

    // Modify CSS for the editor
    element.classList.value = ''
    element.style.position = 'absolute'
    element.style.cursor = cursor

    // Image background
    if (imageBackground.lastChild) imageBackground.removeChild(imageBackground.lastChild)
    imageBackground.appendChild(renderer.createImageBackgroundElement())
  }
</script>

<div bind:this={root} data-canvas-object-id={settings.id} />
<div class="z-0 pointer-events-none" bind:this={imageBackground} />
