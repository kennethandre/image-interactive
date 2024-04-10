<script>
  import { onDestroy } from 'svelte'
  import { store, getters } from 'Editor/store'
  import { selected } from 'Editor/store/ui'
  import * as consts from 'Editor/scripts/consts'
  import FormControl from 'Editor/components/UI/form-controls/form-control'

  let subscribers = []
  let positionOptions = [
    { name: 'Left', value: 'left' },
    { name: 'Right', value: 'right' },
    { name: 'Top', value: 'top' },
    { name: 'Bottom', value: 'bottom' },
  ]
  let backgroundOpacityOptions = {
    min: 0,
    max: 1,
  }

  let selectedObject

  onDestroy(() => {
    subscribers.forEach((unsub) => unsub())
    subscribers = []
  })

  subscribers.push(
    selected.subscribe(() => {
      getSelectedObject()
    })
  )

  subscribers.push(
    store.subscribe(() => {
      getSelectedObject()
    })
  )

  function getSelectedObject() {
    let o = getters.getSelectedObject()
    if (o && o.type !== consts.OBJECT_ARTBOARD) {
      selectedObject = o
    } else {
      selectedObject = undefined
    }
  }
</script>

{#if selectedObject}
  <FormControl type="select" label="Position" group="selected" prop="tooltip_style.position" options={positionOptions} />
  <div class="flex">
    <div class="flex-1"><FormControl type="checkbox" name="Auto Width" group="selected" prop="tooltip_style.auto_width" /></div>
    <div class="flex-1">
      {#if !selectedObject.tooltip_style?.auto_width}
        <FormControl type="number" label="Width" group="selected" prop="tooltip_style.width" integer />
      {/if}
    </div>
  </div>
  <div class="flex">
    <div class="flex-1"><FormControl type="number" label="Offset X" group="selected" prop="tooltip_style.offset_x" /></div>
    <div class="flex-1"><FormControl type="number" label="Offset Y" group="selected" prop="tooltip_style.offset_y" /></div>
  </div>
  <div class="flex">
    <div class="flex-1"><FormControl type="number" label="Padding" group="selected" prop="tooltip_style.padding" integer /></div>
    <div class="flex-1"><FormControl type="number" label="Border Radius" group="selected" prop="tooltip_style.border_radius" integer /></div>
  </div>
  <FormControl type="color" label="BG Color" group="selected" prop="tooltip_style.background_color" />
  <FormControl type="slider" label="Background Opacity" group="selected" prop="tooltip_style.background_opacity" options={backgroundOpacityOptions} />
{/if}
