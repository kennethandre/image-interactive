<script>
  import { onMount, onDestroy } from 'svelte'
  import { fade, slide } from 'svelte/transition'
  import { selected, showMouseoverStylesInEditor } from 'Editor/store/ui'
  import { store, getters, setters } from 'Editor/store'
  import * as consts from 'Editor/scripts/consts'
  import * as utilities from 'Editor/scripts/utilities'
  import FormControl from 'Editor/components/UI/form-controls/form-control'
  import FormSection from 'Editor/components/UI/form-controls/form-section'
  import FormHeading from 'Editor/components/UI/form-controls/form-heading'
  import TooltipSettings from 'Editor/components/canvas/tooltip/tooltip-settings'

  export let visible

  let subscribers = []
  let selectedObject
  let sectionsForObjectType = {}
  let headingsForObjectType = {}
  let controlsForObjectType = {}
  let sectionsForSelectedObject = new Set()
  let headingsForSelectedObject = new Set()
  let controlsForSelectedObject = new Set()
  let selectedTypes = new Set()
  let selectArtboardOptions = []

  setVisibleSectionsAndControls()

  onMount(() => {
    getSelectedObject()
  })
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
    selectedObject = undefined
    let obj = getters.getSelectedObject()

    if (!obj) return
    if (obj.type === consts.OBJECT_GROUP || obj.type === consts.OBJECT_ARTBOARD) return

    selectedObject = obj

    updateSelectedTypes()
    updateSectionsAndControls()
    applySpecialConditions()
  }
  function updateSelectedTypes() {
    if (!selectedObject.type) {
      selectedTypes = new Set()

      for (let id of $selected) {
        let obj = getters.getObject(id)
        if (obj.type !== consts.OBJECT_GROUP && obj.type !== consts.OBJECT_ARTBOARD) selectedTypes.add(obj.type)
      }
    } else {
      selectedTypes = new Set([selectedObject.type])
    }
  }
  function updateSectionsAndControls() {
    sectionsForSelectedObject = new Set()
    headingsForSelectedObject = new Set()
    controlsForSelectedObject = new Set()

    selectedTypes.forEach((type) => {
      for (let section of sectionsForObjectType[type]) {
        sectionsForSelectedObject.add(section)
      }
      for (let heading of headingsForObjectType[type]) {
        headingsForSelectedObject.add(heading)
      }
      for (let control of controlsForObjectType[type]) {
        controlsForSelectedObject.add(control)
      }
    })

    const artboards = getters.getArtboards()
    selectArtboardOptions = []
    for (let artboard of artboards) {
      selectArtboardOptions.push({
        value: artboard.id,
        name: artboard.title,
      })
    }
  }
  function applySpecialConditions() {
    // only spots selected
    // use_icon = true
    if (selectedTypes.size == 1 && selectedTypes.has(consts.OBJECT_SPOT) && selectedObject.default_style.use_icon) {
      // Common
      controlsForSelectedObject.delete('width_px')
      controlsForSelectedObject.delete('height_px')

      // Style
      controlsForSelectedObject.delete('default_style.background_color')
      controlsForSelectedObject.delete('default_style.background_opacity')
      controlsForSelectedObject.delete('default_style.border_radius')
      controlsForSelectedObject.delete('default_style.border_width')
      controlsForSelectedObject.delete('default_style.border_style')
      controlsForSelectedObject.delete('default_style.border_color')
      controlsForSelectedObject.delete('default_style.border_opacity')

      // Mouseover Style
      controlsForSelectedObject.delete('mouseover_style.background_color')
      controlsForSelectedObject.delete('mouseover_style.background_opacity')
      controlsForSelectedObject.delete('mouseover_style.border_radius')
      controlsForSelectedObject.delete('mouseover_style.border_width')
      controlsForSelectedObject.delete('mouseover_style.border_style')
      controlsForSelectedObject.delete('mouseover_style.border_color')
      controlsForSelectedObject.delete('mouseover_style.border_opacity')
    }

    // only spots selected
    // use_icon = false
    if (selectedTypes.size == 1 && selectedTypes.has(consts.OBJECT_SPOT) && !selectedObject.default_style.use_icon) {
      // Common
      controlsForSelectedObject.delete('default_style.icon_size')

      // Style
      controlsForSelectedObject.delete('default_style.icon_fill')

      // Mouseover Style
      controlsForSelectedObject.delete('mouseover_style.icon_fill')

      // Icon
      controlsForSelectedObject.delete('default_style.icon_type')
      controlsForSelectedObject.delete('default_style.icon_fontawesome_id')
      controlsForSelectedObject.delete('default_style.icon_url')
      controlsForSelectedObject.delete('default_style.icon_is_pin')
      controlsForSelectedObject.delete('default_style.icon_shadow')
    }
  }
  function setVisibleSectionsAndControls() {
    sectionsForObjectType[consts.OBJECT_SPOT] = ['Styles', 'Mouseover Styles', 'Icon', 'Tooltip', 'Actions']
    sectionsForObjectType[consts.OBJECT_RECT] = ['Styles', 'Mouseover Styles', 'Tooltip', 'Actions']
    sectionsForObjectType[consts.OBJECT_OVAL] = ['Styles', 'Mouseover Styles', 'Tooltip', 'Actions']
    sectionsForObjectType[consts.OBJECT_POLY] = ['Styles', 'Mouseover Styles', 'Tooltip', 'Actions']
    sectionsForObjectType[consts.OBJECT_TEXT] = ['Text']
    sectionsForObjectType[consts.OBJECT_SVG] = ['Styles', 'Mouseover Styles', 'Tooltip', 'Actions']
    sectionsForObjectType[consts.OBJECT_SVG_SINGLE] = ['Styles', 'Mouseover Styles', 'Tooltip', 'Actions']

    headingsForObjectType[consts.OBJECT_SPOT] = [
      // Common
      // Style
      // Mouseover Style
      // Icon
      // Tooltip
      // Text
      // Actions
    ]
    headingsForObjectType[consts.OBJECT_RECT] = [
      // Common
      // Style
      'Background',
      'Border',
      // Mouseover Style
      // Icon
      // Tooltip
      // Text
      // Actions
    ]
    headingsForObjectType[consts.OBJECT_OVAL] = [
      // Common
      // Style
      'Background',
      'Border',
      // Mouseover Style
      // Icon
      // Tooltip
      // Text
      // Actions
    ]
    headingsForObjectType[consts.OBJECT_POLY] = [
      // Common
      // Style
      'Background',
      'Stroke',
      // Mouseover Style
      // Icon
      // Tooltip
      // Text
      // Actions
    ]
    headingsForObjectType[consts.OBJECT_TEXT] = [
      // Common
      // Style
      // Mouseover Style
      // Icon
      // Tooltip
      // Text
      // Actions
    ]
    headingsForObjectType[consts.OBJECT_SVG] = [
      // Common
      // Style
      'Background',
      'Stroke',
      // Mouseover Style
      // Icon
      // Tooltip
      // Text
      // Actions
    ]
    headingsForObjectType[consts.OBJECT_SVG_SINGLE] = [
      // Common
      // Style
      // Mouseover Style
      // Icon
      // Tooltip
      // Text
      // Actions
    ]

    controlsForObjectType[consts.OBJECT_SPOT] = [
      // Common
      'title',
      'x',
      'y',
      'width_px',
      'height_px',
      'static',

      // Style
      'default_style.opacity',
      'default_style.icon_fill',
      'default_style.background_color',
      'default_style.background_opacity',
      'default_style.border_radius',
      'default_style.border_width',
      'default_style.border_style',
      'default_style.border_color',
      'default_style.border_opacity',

      // Mouseover Style
      'mouseover_style.opacity',
      'mouseover_style.icon_fill',
      'mouseover_style.background_color',
      'mouseover_style.background_opacity',
      'mouseover_style.border_radius',
      'mouseover_style.border_width',
      'mouseover_style.border_style',
      'mouseover_style.border_color',
      'mouseover_style.border_opacity',

      // Icon
      'default_style.use_icon',
      'default_style.icon_size',
      'default_style.icon_type',
      'default_style.icon_fontawesome_id',
      'default_style.icon_fill',
      'default_style.icon_url',
      'default_style.icon_is_pin',
      'default_style.icon_shadow',

      // Tooltip
      'tooltip.enable_tooltip',

      // Text

      // Actions
      'actions.click',
      'actions.script',
      'actions.link',
      'actions.open_link_in_new_window',
      'actions.artboard',
    ]
    controlsForObjectType[consts.OBJECT_RECT] = [
      // Common
      'title',
      'x',
      'y',
      'width',
      'height',
      'static',

      // Style
      'default_style.opacity',
      'default_style.background_type',
      'default_style.background_color',
      'default_style.background_opacity',
      'default_style.border_radius',
      'default_style.border_width',
      'default_style.border_style',
      'default_style.border_color',
      'default_style.border_opacity',
      'default_style.background_image_url',
      'default_style.background_image_opacity',
      'default_style.background_image_scale',
      'default_style.background_image_offset_x',
      'default_style.background_image_offset_y',

      // Mouseover Style
      'mouseover_style.opacity',
      'mouseover_style.background_type',
      'mouseover_style.background_color',
      'mouseover_style.background_opacity',
      'mouseover_style.border_radius',
      'mouseover_style.border_width',
      'mouseover_style.border_style',
      'mouseover_style.border_color',
      'mouseover_style.border_opacity',
      'mouseover_style.background_image_url',
      'mouseover_style.background_image_opacity',
      'mouseover_style.background_image_scale',
      'mouseover_style.background_image_offset_x',
      'mouseover_style.background_image_offset_y',

      // Icon

      // Tooltip
      'tooltip.enable_tooltip',

      // Text

      // Actions
      'actions.click',
      'actions.script',
      'actions.link',
      'actions.open_link_in_new_window',
      'actions.artboard',
    ]
    controlsForObjectType[consts.OBJECT_OVAL] = [
      // Common
      'title',
      'x',
      'y',
      'width',
      'height',
      'static',

      // Style
      'default_style.opacity',
      'default_style.background_type',
      'default_style.background_color',
      'default_style.background_opacity',
      // 'default_style.border_radius',
      'default_style.border_width',
      'default_style.border_style',
      'default_style.border_color',
      'default_style.border_opacity',
      'default_style.background_image_url',
      'default_style.background_image_opacity',
      'default_style.background_image_scale',
      'default_style.background_image_offset_x',
      'default_style.background_image_offset_y',

      // Mouseover Style
      'mouseover_style.opacity',
      'mouseover_style.background_type',
      'mouseover_style.background_color',
      'mouseover_style.background_opacity',
      'mouseover_style.border_radius',
      'mouseover_style.border_width',
      'mouseover_style.border_style',
      'mouseover_style.border_color',
      'mouseover_style.border_opacity',
      'mouseover_style.background_image_url',
      'mouseover_style.background_image_opacity',
      'mouseover_style.background_image_scale',
      'mouseover_style.background_image_offset_x',
      'mouseover_style.background_image_offset_y',

      // Icon

      // Tooltip
      'tooltip.enable_tooltip',

      // Text

      // Actions
      'actions.click',
      'actions.script',
      'actions.link',
      'actions.open_link_in_new_window',
      'actions.artboard',
    ]
    controlsForObjectType[consts.OBJECT_POLY] = [
      // Common
      'title',
      'x',
      'y',
      'width',
      'height',
      'static',

      // Style
      'default_style.opacity',
      'default_style.background_type',
      'default_style.background_color',
      'default_style.background_opacity',
      'default_style.stroke_color',
      'default_style.stroke_opacity',
      'default_style.stroke_width',
      'default_style.stroke_dasharray',
      'default_style.stroke_linecap',
      'default_style.background_image_url',
      'default_style.background_image_opacity',
      'default_style.background_image_scale',
      'default_style.background_image_offset_x',
      'default_style.background_image_offset_y',

      // Mouseover Style
      'mouseover_style.opacity',
      'mouseover_style.background_type',
      'mouseover_style.background_color',
      'mouseover_style.background_opacity',
      'mouseover_style.stroke_color',
      'mouseover_style.stroke_opacity',
      'mouseover_style.stroke_width',
      'mouseover_style.stroke_dasharray',
      'mouseover_style.stroke_linecap',
      'mouseover_style.background_image_url',
      'mouseover_style.background_image_opacity',
      'mouseover_style.background_image_scale',
      'mouseover_style.background_image_offset_x',
      'mouseover_style.background_image_offset_y',

      // Icon

      // Tooltip
      'tooltip.enable_tooltip',

      // Text

      // Actions
      'actions.click',
      'actions.script',
      'actions.link',
      'actions.open_link_in_new_window',
      'actions.artboard',
    ]
    controlsForObjectType[consts.OBJECT_TEXT] = [
      // Common
      'title',
      'x',
      'y',

      // Styles

      // Mouseover Styles

      // Icon

      // Tooltip

      // Text
      'text.text',
      'text.font_family',
      'text.font_size',
      'text.font_weight',
      'text.text_color',
      'text.text_opacity',

      // Actions
    ]
    controlsForObjectType[consts.OBJECT_SVG] = [
      // Common
      'title',
      'x',
      'y',
      'width',
      'height',
      'static',

      // Style
      'default_style.opacity',
      'default_style.background_color',
      'default_style.background_opacity',
      'default_style.stroke_color',
      'default_style.stroke_opacity',
      'default_style.stroke_width',
      'default_style.stroke_dasharray',
      'default_style.stroke_linecap',

      // Mouseover Style
      'mouseover_style.opacity',
      'mouseover_style.background_color',
      'mouseover_style.background_opacity',
      'mouseover_style.stroke_color',
      'mouseover_style.stroke_opacity',
      'mouseover_style.stroke_width',
      'mouseover_style.stroke_dasharray',
      'mouseover_style.stroke_linecap',

      // Icon

      // Tooltip
      'tooltip.enable_tooltip',

      // Text

      // Actions
      'actions.click',
      'actions.script',
      'actions.link',
      'actions.open_link_in_new_window',
      'actions.artboard',
    ]
    controlsForObjectType[consts.OBJECT_SVG_SINGLE] = [
      // Common
      'title',
      'x',
      'y',
      'width',
      'height',
      'static',

      // Style
      'default_style.opacity',
      'default_style.filters',

      // Mouseover Style
      'mouseover_style.opacity',
      'mouseover_style.filters',

      // Icon

      // Tooltip
      'tooltip.enable_tooltip',

      // Text

      // Actions
      'actions.click',
      'actions.script',
      'actions.link',
      'actions.open_link_in_new_window',
      'actions.artboard',
    ]
  }
  function openIconLibrary() {
    let event = new Event(consts.EVENT_OPEN_ICON_LIBRARY_MODAL)
    document.dispatchEvent(event)
  }
  function copyFromStyle() {
    let styles = utilities.deepExtend({}, selectedObject.default_style)
    setters.setValue({ group: 'selected', prop: 'mouseover_style', value: styles })
  }
</script>

{#if selectedObject && visible}
  <div>
    <div class="p-2">
      {#if controlsForSelectedObject.has('title')}
        <FormControl type="text" label="Title" group="selected" prop="title" />
      {/if}
      <div class="flex">
        {#if controlsForSelectedObject.has('x')}
          <FormControl type="number" label="X" group="selected" prop="x" />
        {/if}
        {#if controlsForSelectedObject.has('y')}
          <FormControl type="number" label="Y" group="selected" prop="y" />
        {/if}
      </div>
      <div class="flex">
        {#if controlsForSelectedObject.has('width')}
          <div class="flex-1"><FormControl type="number" label="Width" group="selected" prop="width" min="0" /></div>
        {/if}

        {#if controlsForSelectedObject.has('height')}
          <div class="flex-1"><FormControl type="number" label="Height" group="selected" prop="height" min="0" /></div>
        {/if}
      </div>
      <div class="flex">
        {#if controlsForSelectedObject.has('width_px')}
          <FormControl type="number" label="Spot Width (px)" group="selected" prop="width" />
        {/if}
        {#if controlsForSelectedObject.has('height_px')}
          <FormControl type="number" label="Spot Height (px)" group="selected" prop="height" />
        {/if}
      </div>
      <div class="flex">
        {#if controlsForSelectedObject.has('default_style.icon_size')}
          <div class="flex-1"><FormControl type="number" label="Icon Size (px)" group="selected" prop="default_style.icon_size" /></div>
          <div class="flex-1" />
        {/if}
      </div>
      {#if controlsForSelectedObject.has('static')}
        <FormControl type="checkbox" name="Static" group="selected" prop="static" description="If enabled, the object will not respond to mouse events and will not show its tooltip." />
      {/if}
    </div>

    {#if sectionsForSelectedObject.has('Styles')}
      <FormSection title="Default Style" collapsed>
        {#if controlsForSelectedObject.has('default_style.opacity')}
          <FormControl type="slider" label="Opacity" group="selected" prop="default_style.opacity" options={{ min: 0, max: 1 }} />
        {/if}

        <!-- Background -->
        {#if headingsForSelectedObject.has('Background')}
          <FormHeading title="Background" />
        {/if}
        {#if controlsForSelectedObject.has('default_style.background_type')}
          <FormControl
            type="button-group"
            label="Background Type"
            group="selected"
            prop="default_style.background_type"
            options={[
              { name: 'Color', value: 'color' },
              { name: 'Image', value: 'image' },
            ]}
          />
        {/if}
        {#if selectedObject.default_style.background_type === 'color'}
          <div transition:fade|local={{ duration: 150 }}>
            <div transition:slide|local={{ duration: 150 }}>
              {#if controlsForSelectedObject.has('default_style.background_color')}
                <FormControl type="color" label="Background Color" group="selected" prop="default_style.background_color" />
              {/if}
              {#if controlsForSelectedObject.has('default_style.background_opacity')}
                <FormControl type="slider" label="Background Opacity" group="selected" prop="default_style.background_opacity" options={{ min: 0, max: 1 }} />
              {/if}
            </div>
          </div>
        {/if}
        {#if selectedObject.default_style.background_type === 'image'}
          <div transition:fade|local={{ duration: 150 }}>
            <div transition:slide|local={{ duration: 150 }}>
              {#if controlsForSelectedObject.has('default_style.background_image_url')}
                {#if window.imageMapProConfig.wp}
                  <FormControl type="wp-image" label="Background Image" group="selected" prop="default_style.background_image_url" />
                {:else}
                  <FormControl type="text" label="Background Image URL" group="selected" prop="default_style.background_image_url" />
                {/if}
              {/if}
              {#if controlsForSelectedObject.has('default_style.background_image_opacity')}
                <FormControl type="slider" label="Background Image Opacity" group="selected" prop="default_style.background_image_opacity" options={{ min: 0, max: 1 }} />
              {/if}
              {#if controlsForSelectedObject.has('default_style.background_image_scale')}
                <FormControl type="slider" label="Background Image Scale" group="selected" prop="default_style.background_image_scale" options={{ min: 0, max: 2 }} />
              {/if}
              <div class="flex">
                {#if controlsForSelectedObject.has('default_style.background_image_offset_x')}
                  <FormControl type="number" label="Background Image Offset X" group="selected" prop="default_style.background_image_offset_x" />
                {/if}
                {#if controlsForSelectedObject.has('default_style.background_image_offset_y')}
                  <FormControl type="number" label="Background Image Offset Y" group="selected" prop="default_style.background_image_offset_y" />
                {/if}
              </div>
            </div>
          </div>
        {/if}

        <!-- Border -->
        {#if headingsForSelectedObject.has('Border')}
          <FormHeading title="Border" />
        {/if}
        <div class="flex">
          <div class="flex-1">
            {#if controlsForSelectedObject.has('default_style.border_width')}
              <FormControl type="number" integer label="Border Width" group="selected" prop="default_style.border_width" />
            {/if}
          </div>
          <div class="flex-1">
            {#if controlsForSelectedObject.has('default_style.border_radius')}
              <FormControl type="number" integer label="Border Radius" group="selected" prop="default_style.border_radius" />
            {/if}
          </div>
        </div>

        <div class="flex">
          <div class="flex-1">
            {#if controlsForSelectedObject.has('default_style.border_style')}
              <FormControl
                type="select"
                label="Border Style"
                group="selected"
                prop="default_style.border_style"
                options={[
                  { name: 'Dotted', value: 'dotted' },
                  { name: 'Dashed', value: 'dashed' },
                  { name: 'Solid', value: 'solid' },
                  { name: 'Double', value: 'double' },
                  { name: 'Groove', value: 'groove' },
                  { name: 'Ridge', value: 'ridge' },
                  { name: 'Inset', value: 'inset' },
                  { name: 'Outset', value: 'outset' },
                  { name: 'None', value: 'none' },
                  { name: 'Hidden', value: 'hidden' },
                ]}
              />
            {/if}
          </div>
          <div class="flex-1">
            {#if controlsForSelectedObject.has('default_style.border_color')}
              <FormControl type="color" label="Border Color" group="selected" prop="default_style.border_color" />
            {/if}
          </div>
        </div>
        {#if controlsForSelectedObject.has('default_style.border_opacity')}
          <FormControl type="slider" label="Border Opacity" group="selected" prop="default_style.border_opacity" options={{ min: 0, max: 1 }} />
        {/if}

        <!-- Stroke -->

        {#if headingsForSelectedObject.has('Stroke')}
          <FormHeading title="Stroke" />
        {/if}
        <div class="flex">
          <div class="flex-1">
            {#if controlsForSelectedObject.has('default_style.stroke_color')}
              <FormControl type="color" label="Stroke Color" group="selected" prop="default_style.stroke_color" />
            {/if}
          </div>
          <div class="flex-1">
            {#if controlsForSelectedObject.has('default_style.stroke_width')}
              <FormControl type="number" integer label="Stroke Width" group="selected" prop="default_style.stroke_width" />
            {/if}
          </div>
        </div>
        <div class="flex">
          <div class="flex-1">
            {#if controlsForSelectedObject.has('default_style.stroke_dasharray')}
              <FormControl type="text" label="Stroke Dasharray" group="selected" prop="default_style.stroke_dasharray" />
            {/if}
          </div>
          <div class="flex-1">
            {#if controlsForSelectedObject.has('default_style.stroke_linecap')}
              <FormControl
                type="select"
                label="Stroke Linecap"
                group="selected"
                prop="default_style.stroke_linecap"
                options={[
                  { name: 'Round', value: 'round' },
                  { name: 'Butt', value: 'butt' },
                  { name: 'Square', value: 'square' },
                ]}
              />
            {/if}
          </div>
        </div>
        {#if controlsForSelectedObject.has('default_style.stroke_opacity')}
          <FormControl type="slider" label="Stroke Opacity" group="selected" prop="default_style.stroke_opacity" options={{ min: 0, max: 1 }} />
        {/if}

        <!-- Icon -->
        {#if controlsForSelectedObject.has('default_style.icon_fill')}
          <FormControl type="color" label="Icon Fill" group="selected" prop="default_style.icon_fill" />
        {/if}

        <!-- Filters -->
        {#if controlsForSelectedObject.has('default_style.filters')}
          <FormControl type="filters" label="Filters" group="selected" prop="default_style.filters" />
        {/if}
      </FormSection>
    {/if}

    {#if !selectedObject.static}
      <div transition:fade|local={{ duration: 150 }}>
        <div transition:slide|local={{ duration: 150 }}>
          {#if sectionsForSelectedObject.has('Mouseover Styles')}
            <FormSection title="Mouseover Style" collapsed>
              <FormControl type="checkbox" name="Display in Editor" bind:value={$showMouseoverStylesInEditor} />
              <FormControl type="button" name="Copy from Styles" action={copyFromStyle} />
              {#if controlsForSelectedObject.has('mouseover_style.opacity')}
                <FormControl type="slider" label="Opacity" group="selected" prop="mouseover_style.opacity" options={{ min: 0, max: 1 }} />
              {/if}

              <!-- Background -->
              {#if headingsForSelectedObject.has('Background')}
                <FormHeading title="Background" />
              {/if}
              {#if selectedObject.default_style.background_type === 'color'}
                <div transition:fade|local={{ duration: 150 }}>
                  <div transition:slide|local={{ duration: 150 }}>
                    {#if controlsForSelectedObject.has('mouseover_style.background_color')}
                      <FormControl type="color" label="Background Color" group="selected" prop="mouseover_style.background_color" />
                    {/if}
                    {#if controlsForSelectedObject.has('mouseover_style.background_opacity')}
                      <FormControl type="slider" label="Background Opacity" group="selected" prop="mouseover_style.background_opacity" options={{ min: 0, max: 1 }} />
                    {/if}
                  </div>
                </div>
              {/if}
              {#if selectedObject.default_style.background_type === 'image'}
                <div transition:fade|local={{ duration: 150 }}>
                  <div transition:slide|local={{ duration: 150 }}>
                    {#if controlsForSelectedObject.has('mouseover_style.background_image_url')}
                      {#if window.imageMapProConfig.wp}
                        <FormControl type="wp-image" label="Background Image" group="selected" prop="mouseover_style.background_image_url" />
                      {:else}
                        <FormControl type="text" label="Background Image URL" group="selected" prop="mouseover_style.background_image_url" />
                      {/if}
                    {/if}
                    {#if controlsForSelectedObject.has('mouseover_style.background_image_opacity')}
                      <FormControl type="slider" label="Background Image Opacity" group="selected" prop="mouseover_style.background_image_opacity" options={{ min: 0, max: 1 }} />
                    {/if}
                    {#if controlsForSelectedObject.has('mouseover_style.background_image_scale')}
                      <FormControl type="slider" label="Background Image Scale" group="selected" prop="mouseover_style.background_image_scale" options={{ min: 0, max: 2 }} />
                    {/if}
                    <div class="flex">
                      {#if controlsForSelectedObject.has('mouseover_style.background_image_offset_x')}
                        <FormControl type="number" integer label="Background Image Offset X" group="selected" prop="mouseover_style.background_image_offset_x" />
                      {/if}
                      {#if controlsForSelectedObject.has('mouseover_style.background_image_offset_y')}
                        <FormControl type="number" integer label="Background Image Offset Y" group="selected" prop="mouseover_style.background_image_offset_y" />
                      {/if}
                    </div>
                  </div>
                </div>
              {/if}

              <!-- Border -->
              {#if headingsForSelectedObject.has('Border')}
                <FormHeading title="Border" />
              {/if}
              <div class="flex">
                {#if controlsForSelectedObject.has('mouseover_style.border_radius')}
                  <FormControl type="number" integer label="Border Radius" group="selected" prop="mouseover_style.border_radius" />
                {/if}
                {#if controlsForSelectedObject.has('mouseover_style.border_width')}
                  <FormControl type="number" integer label="Border Width" group="selected" prop="mouseover_style.border_width" />
                {/if}
              </div>
              <div class="flex">
                <div class="flex-1">
                  {#if controlsForSelectedObject.has('mouseover_style.border_style')}
                    <FormControl
                      type="select"
                      label="Border Style"
                      group="selected"
                      prop="mouseover_style.border_style"
                      options={[
                        { name: 'Dotted', value: 'dotted' },
                        { name: 'Dashed', value: 'dashed' },
                        { name: 'Solid', value: 'solid' },
                        { name: 'Double', value: 'double' },
                        { name: 'Groove', value: 'groove' },
                        { name: 'Ridge', value: 'ridge' },
                        { name: 'Inset', value: 'inset' },
                        { name: 'Outset', value: 'outset' },
                        { name: 'None', value: 'none' },
                        { name: 'Hidden', value: 'hidden' },
                      ]}
                    />
                  {/if}
                </div>
                <div class="flex-1">
                  {#if controlsForSelectedObject.has('mouseover_style.border_color')}
                    <FormControl type="color" label="Border Color" group="selected" prop="mouseover_style.border_color" />
                  {/if}
                </div>
              </div>
              {#if controlsForSelectedObject.has('mouseover_style.border_opacity')}
                <FormControl type="slider" label="Border Opacity" group="selected" prop="mouseover_style.border_opacity" options={{ min: 0, max: 1 }} />
              {/if}

              <!-- Stroke -->
              {#if headingsForSelectedObject.has('Stroke')}
                <FormHeading title="Stroke" />
              {/if}
              <div class="flex">
                <div class="flex-1">
                  {#if controlsForSelectedObject.has('mouseover_style.stroke_color')}
                    <FormControl type="color" label="Stroke Color" group="selected" prop="mouseover_style.stroke_color" />
                  {/if}
                </div>
                <div class="flex-1">
                  {#if controlsForSelectedObject.has('mouseover_style.stroke_width')}
                    <FormControl type="number" integer label="Stroke Width" group="selected" prop="mouseover_style.stroke_width" />
                  {/if}
                </div>
              </div>
              <div class="flex">
                <div class="flex-1">
                  {#if controlsForSelectedObject.has('mouseover_style.stroke_dasharray')}
                    <FormControl type="text" label="Stroke Dasharray" group="selected" prop="mouseover_style.stroke_dasharray" />
                  {/if}
                </div>
                <div class="flex-1">
                  {#if controlsForSelectedObject.has('mouseover_style.stroke_linecap')}
                    <FormControl
                      type="select"
                      label="Stroke Linecap"
                      group="selected"
                      prop="mouseover_style.stroke_linecap"
                      options={[
                        { name: 'Round', value: 'round' },
                        { name: 'Butt', value: 'butt' },
                        { name: 'Square', value: 'square' },
                      ]}
                    />
                  {/if}
                </div>
              </div>
              {#if controlsForSelectedObject.has('mouseover_style.stroke_opacity')}
                <FormControl type="slider" label="Stroke Opacity" group="selected" prop="mouseover_style.stroke_opacity" options={{ min: 0, max: 1 }} />
              {/if}

              <!-- Icon -->
              {#if controlsForSelectedObject.has('mouseover_style.icon_fill')}
                <FormControl type="color" label="SVG Icon Fill Color" group="selected" prop="mouseover_style.icon_fill" />
              {/if}

              <!-- Filters -->
              {#if controlsForSelectedObject.has('mouseover_style.filters')}
                <FormControl type="filters" label="Filters" group="selected" prop="mouseover_style.filters" />
              {/if}
            </FormSection>
          {/if}
        </div>
      </div>
    {/if}

    {#if sectionsForSelectedObject.has('Icon')}
      <FormSection title="Icon" collapsed>
        {#if controlsForSelectedObject.has('default_style.use_icon')}
          <FormControl type="checkbox" name="Use Icon" group="selected" prop="default_style.use_icon" />
        {/if}
        {#if controlsForSelectedObject.has('default_style.icon_type')}
          <FormControl
            type="button-group"
            label="Icon Type"
            group="selected"
            prop="default_style.icon_type"
            options={[
              { name: 'From Library', value: 'library' },
              { name: 'Custom', value: 'custom' },
            ]}
          />
        {/if}
        {#if controlsForSelectedObject.has('default_style.icon_fontawesome_id')}
          <FormControl type="text" label="icon_fontawesome_id" group="selected" prop="default_style.icon_fontawesome_id" hidden />
        {/if}
        {#if selectedObject.default_style.icon_type === 'custom'}
          <div transition:fade|local={{ duration: 150 }}>
            <div transition:slide|local={{ duration: 150 }}>
              {#if controlsForSelectedObject.has('default_style.icon_url')}
                {#if window.imageMapProConfig.wp}
                  <FormControl type="wp-image" label="Icon" group="selected" prop="default_style.icon_url" />
                {:else}
                  <FormControl type="text" label="Icon URL" group="selected" prop="default_style.icon_url" />
                {/if}
              {/if}
            </div>
          </div>
        {/if}
        {#if selectedObject.default_style.icon_type === 'library'}
          <div transition:fade|local={{ duration: 150 }}>
            <div transition:slide|local={{ duration: 150 }}>
              {#if controlsForSelectedObject.has('default_style.icon_url')}
                <FormControl type="button" name="Choose Icon from Library" action={openIconLibrary} />
              {/if}
            </div>
          </div>
        {/if}
        {#if controlsForSelectedObject.has('default_style.icon_is_pin')}
          <FormControl type="checkbox" name="Icon is a Pin" group="selected" prop="default_style.icon_is_pin" />
        {/if}
        {#if controlsForSelectedObject.has('default_style.icon_shadow')}
          <FormControl type="checkbox" name="Icon Shadow" group="selected" prop="default_style.icon_shadow" />
        {/if}
      </FormSection>
    {/if}

    {#if !selectedObject.static}
      <div transition:fade|local={{ duration: 150 }}>
        <div transition:slide|local={{ duration: 150 }}>
          {#if sectionsForSelectedObject.has('Tooltip')}
            <FormSection title="Tooltip" collapsed>
              {#if controlsForSelectedObject.has('tooltip.enable_tooltip')}
                <FormControl type="checkbox" name="Enable Tooltip" group="selected" prop="tooltip.enable_tooltip" />
              {/if}
              {#if selectedObject.tooltip.enable_tooltip}
                <div transition:fade|local={{ duration: 150 }}>
                  <div transition:slide|local={{ duration: 150 }}>
                    <TooltipSettings />
                  </div>
                </div>
              {/if}
            </FormSection>
          {/if}
        </div>
      </div>
    {/if}

    {#if sectionsForSelectedObject.has('Text')}
      <FormSection title="Text" collapsed>
        {#if controlsForSelectedObject.has('text.text')}
          <FormControl type="text" label="Text" group="selected" prop="text.text" />
        {/if}

        <div class="flex">
          <div class="flex-[5]">
            {#if controlsForSelectedObject.has('text.font_family')}
              <FormControl type="text" label="Font Family" group="selected" prop="text.font_family" />
            {/if}
          </div>
          <div class="flex-[3]">
            {#if controlsForSelectedObject.has('text.font_size')}
              <FormControl type="number" integer label="Font Size" group="selected" prop="text.font_size" />
            {/if}
          </div>
        </div>
        <div class="flex">
          <div class="flex-[5]">
            {#if controlsForSelectedObject.has('text.font_weight')}
              <FormControl type="number" integer label="Font Weight" group="selected" prop="text.font_weight" />
            {/if}
          </div>
          <div class="flex-[3]">
            {#if controlsForSelectedObject.has('text.text_color')}
              <FormControl type="color" label="Color" group="selected" prop="text.text_color" />
            {/if}
          </div>
        </div>

        {#if controlsForSelectedObject.has('text.text_opacity')}
          <FormControl type="slider" label="Text Opacity" group="selected" prop="text.text_opacity" options={{ min: 0, max: 1 }} />
        {/if}
      </FormSection>
    {/if}

    {#if !selectedObject.static}
      <div transition:fade|local={{ duration: 150 }}>
        <div transition:slide|local={{ duration: 150 }}>
          {#if sectionsForSelectedObject.has('Actions')}
            <FormSection title="Actions" collapsed>
              {#if controlsForSelectedObject.has('actions.click')}
                <FormControl
                  type="select"
                  label="Click Action"
                  group="selected"
                  prop="actions.click"
                  options={[
                    { name: 'No Action', value: 'no-action' },
                    { name: 'Change Artboard', value: 'change-artboard' },
                    { name: 'Run Script', value: 'run-script' },
                    { name: 'Follow Link', value: 'follow-link' },
                  ]}
                />
              {/if}
              {#if controlsForSelectedObject.has('actions.script') && selectedObject.actions.click === 'run-script'}
                <div transition:fade|local={{ duration: 150 }}>
                  <div transition:slide|local={{ duration: 150 }}>
                    <FormControl type="textarea" label="Script to Run" group="selected" prop="actions.script" />
                  </div>
                </div>
              {/if}
              {#if controlsForSelectedObject.has('actions.link') && selectedObject.actions.click === 'follow-link'}
                <div transition:fade|local={{ duration: 150 }}>
                  <div transition:slide|local={{ duration: 150 }}>
                    <FormControl type="text" label="URL" group="selected" prop="actions.link" />
                  </div>
                </div>
              {/if}
              {#if controlsForSelectedObject.has('actions.open_link_in_new_window') && selectedObject.actions.click === 'follow-link'}
                <div transition:fade|local={{ duration: 150 }}>
                  <div transition:slide|local={{ duration: 150 }}>
                    <FormControl type="checkbox" name="Open in New Window" group="selected" prop="actions.open_link_in_new_window" />
                  </div>
                </div>
              {/if}
              {#if controlsForSelectedObject.has('actions.artboard') && selectedObject.actions.click === 'change-artboard'}
                <div transition:fade|local={{ duration: 150 }}>
                  <div transition:slide|local={{ duration: 150 }}>
                    <FormControl type="select" name="Artboard" group="selected" prop="actions.artboard" options={selectArtboardOptions} />
                  </div>
                </div>
              {/if}
            </FormSection>
          {/if}
        </div>
      </div>
    {/if}
  </div>
{/if}
