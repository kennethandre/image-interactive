<script>
  import { afterUpdate, onMount } from 'svelte'
  import * as utilities from 'Editor/scripts/utilities'
  import SVGRenderer from 'Client/UI/objects/svg'
  import { showMouseoverStylesInEditor } from 'Editor/store/ui'

  export let settings
  export let tempSettings
  export let cursor

  let root
  let style
  let renderer

  $: renderSettings = utilities.deepExtend({}, settings, tempSettings)
  $: settings, (tempSettings = {})

  onMount(() => {
    renderer = new SVGRenderer(renderSettings, {
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

    root.appendChild(renderer.element)
  })

  afterUpdate(() => {
    redraw()
  })

  export function redraw() {
    let modifiedSettings = utilities.deepExtend({}, renderSettings)
    if ($showMouseoverStylesInEditor) modifiedSettings.default_style = modifiedSettings.mouseover_style

    renderer.options = modifiedSettings
    style = renderer.createCSSRules(modifiedSettings.default_style)
    root.style.cursor = cursor
  }
</script>

<div bind:this={root} {style} class="absolute" data-canvas-object-id={settings.id} />
