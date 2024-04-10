<script>
  import { afterUpdate, onMount } from 'svelte'
  import * as utilities from 'Editor/scripts/utilities'
  import TextRenderer from 'Client/UI/objects/text'

  export let settings
  export let tempSettings
  export let cursor

  let root
  let renderer
  let element

  $: renderSettings = utilities.deepExtend({}, settings, tempSettings)
  $: settings, (tempSettings = {})

  onMount(() => {
    renderer = new TextRenderer(renderSettings, {
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
  })

  afterUpdate(() => {
    redraw()
  })

  export function redraw() {
    renderer.options = renderSettings
    element = renderer.createElement()

    // Generate and apply CSS
    let css = renderer.createCSSRules(renderSettings.default_style)
    element.setAttribute('style', css)

    // Modify CSS for the editor
    element.classList.value = ''
    element.style.position = 'absolute'
    element.style.cursor = cursor
    element.classList.add('select-none')

    // Append to DOM
    if (root.lastChild) root.removeChild(root.lastChild)
    root.appendChild(element)
  }
</script>

<div bind:this={root} data-canvas-object-id={settings.id} />
