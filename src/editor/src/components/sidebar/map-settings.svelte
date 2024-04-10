<script>
  import { fade, slide } from 'svelte/transition'
  import { onDestroy } from 'svelte'
  import { store, getters } from 'Editor/store'
  import * as consts from 'Editor/scripts/consts'
  import FormControl from 'Editor/components/UI/form-controls/form-control'
  import FormSection from 'Editor/components/UI/form-controls/form-section'
  import FormHeading from 'Editor/components/UI/form-controls/form-heading'

  let subscribers = []
  let mapSettings = getters.getSettings()

  onDestroy(() => {
    subscribers.forEach((unsub) => unsub())
    subscribers = []
  })

  subscribers.push(
    store.subscribe(() => {
      mapSettings = getters.getSettings()
    })
  )

  let uiThemeOptions = [
    { name: 'Light', value: 'light' },
    { name: 'Dark', value: 'dark' },
  ]

  let pageloadAnimationOptions = [
    { name: 'None', value: 'none' },
    { name: 'Flash', value: 'flash' },
    { name: 'Grow', value: 'grow' },
    { name: 'Fade', value: 'fade' },
    { name: 'Fall down', value: 'fall-down' },
  ]

  let showTooltipsOptions = [
    { name: 'Mouseover', value: 'mouseover' },
    { name: 'Click', value: 'click' },
  ]

  let tooltipAnimationOptions = [
    { name: 'None', value: 'none' },
    { name: 'Fade', value: 'fade' },
    { name: 'Grow', value: 'grow' },
  ]

  let fullscreenTooltipsOptions = [
    { name: 'None', value: 'none' },
    { name: 'Mobile Only', value: 'mobile-only' },
    { name: 'Always', value: 'always' },
  ]

  let menuPositionOptions = [
    { name: 'Left', value: 'left' },
    { name: 'Right', value: 'right' },
  ]

  let fullscreenTooltipsBackgroundOpacityOptions = {
    min: 0,
    max: 1,
  }

  let objectListMenuStyleOptions = [
    { name: 'Default', value: 'default' },
    { name: 'On Top', value: 'on-top' },
    { name: 'Detached', value: 'detached' },
  ]

  let detachedCodeText = `<div data-imp-detached-menu="My Map"></div>`
  function handleCopyDetachedCode() {
    navigator.clipboard.writeText(detachedCodeText)
  }
  function handleEditObjectDefaults() {
    let event = new Event(consts.EVENT_OPEN_OBJECT_DEFAULTS_MODAL)
    document.dispatchEvent(event)
  }
</script>

<div>
  <div class="p-2">
    <FormControl type="text" label="Name" group="general" prop="name" />
    {#if window.imageMapProConfig.wp === true}
      <FormControl type="text" label="Shortcode" group="general" prop="shortcode" />
    {/if}
    <FormControl type="button-group" label="UI Theme" group="general" prop="ui_theme" options={uiThemeOptions} />
    <FormControl
      type="checkbox"
      name="Responsive"
      group="general"
      prop="responsive"
      description="If checked, the image map will fit its parent element and keep its aspect ratio."
    />
  </div>

  <!-- Fullscreen -->
  <FormSection title="Fullscreen" collapsed opacity="0.5">
    <FormControl type="checkbox" name="Enable Fullscreen" group="fullscreen" prop="enable_fullscreen_mode" />
    {#if mapSettings.fullscreen.enable_fullscreen_mode}
      <div transition:fade|local={{ duration: 150 }}>
        <div transition:slide|local={{ duration: 150 }}>
          <FormControl type="checkbox" name="Start in Fullscreen" group="fullscreen" prop="start_in_fullscreen_mode" />
        </div>
      </div>
    {/if}
  </FormSection>

  <!-- Objects -->
  <FormSection title="Objects" collapsed opacity="0.5">
    <FormControl
      type="button-group"
      label="Pageload Animation"
      group="objectConfig"
      prop="pageload_animation"
      options={pageloadAnimationOptions}
    />

    <FormControl type="checkbox" name="Glowing Objects" group="objectConfig" prop="glowing_objects" />
    {#if mapSettings.objectConfig.glowing_objects}
      <div transition:fade|local={{ duration: 150 }}>
        <div transition:slide|local={{ duration: 150 }}>
          <FormControl
            type="checkbox"
            name="Stop Glowing on Mouseover"
            group="objectConfig"
            prop="stop_glowing_on_mouseover"
          />
          <div class="flex">
            <div class="flex-[3]">
              <FormControl
                type="slider"
                label="Glow Opacity"
                group="objectConfig"
                prop="glow_opacity"
                options={{ min: 0, max: 1 }}
              />
            </div>
            <div class="flex-1">
              <FormControl type="color" label="Color" group="objectConfig" prop="glowing_objects_color" />
            </div>
          </div>
        </div>
      </div>
    {/if}
    <FormControl
      type="checkbox"
      name="Scale Spots on Zoom"
      group="objectConfig"
      prop="scale_spots"
      description="When the image map is zoomed, the spots will keep their specified size in pixels."
    />
  </FormSection>

  <!-- Tooltips -->
  <FormSection title="Tooltips" collapsed opacity="0.5">
    <FormControl type="checkbox" name="Enable Tooltips" group="tooltips" prop="enable_tooltips" />
    {#if mapSettings.tooltips.enable_tooltips}
      <div transition:fade|local={{ duration: 150 }}>
        <div transition:slide|local={{ duration: 150 }}>
          <FormControl
            type="button-group"
            label="Tooltip Show Condition"
            group="tooltips"
            prop="show_tooltips"
            options={showTooltipsOptions}
          />
          <FormControl
            type="button-group"
            label="Tooltip Animation"
            group="tooltips"
            prop="tooltip_animation"
            options={tooltipAnimationOptions}
          />
          <FormControl
            type="button-group"
            label="Show Fullscreen Tooltips"
            group="tooltips"
            prop="fullscreen_tooltips"
            options={fullscreenTooltipsOptions}
          />
          {#if mapSettings.tooltips.fullscreen_tooltips === 'always' || mapSettings.tooltips.fullscreen_tooltips === 'mobile-only'}
            <div transition:fade|local={{ duration: 150 }}>
              <div transition:slide|local={{ duration: 150 }}>
                <FormControl type="color" label="Fullscreen Background" group="tooltips" prop="fullscreen_background" />
                <FormControl
                  type="slider"
                  label="Fullscreen Background Opacity"
                  group="tooltips"
                  prop="fullscreen_background_opacity"
                  options={fullscreenTooltipsBackgroundOpacityOptions}
                />
              </div>
            </div>
          {/if}
          {#if mapSettings.tooltips.fullscreen_tooltips === 'none' || mapSettings.tooltips.fullscreen_tooltips === 'mobile-only'}
            <div transition:fade|local={{ duration: 150 }}>
              <div transition:slide|local={{ duration: 150 }}>
                <FormControl
                  type="checkbox"
                  name="Sticky Tooltips"
                  group="tooltips"
                  prop="sticky_tooltips"
                  description="Tooltips will stick to the mouse. Disabled on touchscreen devices."
                />
                <FormControl
                  type="checkbox"
                  name="Constrain Tooltips"
                  group="tooltips"
                  prop="constrain_tooltips"
                  description="If a tooltip is too big, it will not go out of the screen bounds."
                />
              </div>
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </FormSection>

  <!-- Zooming -->
  <FormSection title="Zooming" collapsed opacity="0.5">
    <FormControl type="checkbox" name="Enable Zooming" group="zooming" prop="enable_zooming" />
    {#if mapSettings.zooming.enable_zooming}
      <div transition:fade|local={{ duration: 150 }}>
        <div transition:slide|local={{ duration: 150 }}>
          <FormControl
            type="slider"
            integer
            label="Max Zoom"
            group="zooming"
            prop="max_zoom"
            options={{ min: 2, max: 6 }}
          />
          <FormControl
            type="checkbox"
            name="Limit Max Zoom to Image Size"
            group="zooming"
            prop="limit_max_zoom_to_image_size"
          />
          <FormControl type="checkbox" name="Hold CTRL/CMD to Zoom" group="zooming" prop="hold_ctrl_to_zoom" />
          <FormControl type="checkbox" name="Zoom on Object Click" group="zooming" prop="zoom_on_object_click" />
          <FormControl type="checkbox" name="Enable Navigator" group="zooming" prop="enable_navigator" />
          <FormControl type="checkbox" name="Enable Zoom Buttons" group="zooming" prop="enable_zoom_buttons" />
        </div>
      </div>
    {/if}
  </FormSection>

  <!-- Object Menu -->
  <FormSection title="Object List" collapsed opacity="0.5">
    <FormControl type="checkbox" name="Enable Object List" group="object_list" prop="enable_object_list" />
    {#if mapSettings.object_list.enable_object_list}
      <div transition:fade|local={{ duration: 150 }}>
        <div transition:slide|local={{ duration: 150 }}>
          <FormControl
            type="button-group"
            label="Menu Style"
            group="object_list"
            prop="menu_style"
            options={objectListMenuStyleOptions}
          />
          {#if mapSettings.object_list.menu_style === 'detached'}
            <div transition:fade|local={{ duration: 150 }}>
              <div transition:slide|local={{ duration: 150 }}>
                <div class="m-1 p-2 bg-theme-400 bg-opacity-10 rounded-md" style="font-size: 11px;">
                  <div class="p-1">
                    <div class="mb-2 opacity-50">Use this code to place the image map anywhere in your site:</div>
                    <div class="font-mono">{detachedCodeText}</div>
                  </div>
                  <FormControl type="button" name="Copy" icon="fa fa-copy" action={handleCopyDetachedCode} />
                </div>
              </div>
            </div>
          {/if}
          {#if mapSettings.object_list.menu_style !== 'detached'}
            <div transition:fade|local={{ duration: 150 }}>
              <div transition:slide|local={{ duration: 150 }}>
                <FormControl
                  type="button-group"
                  label="Menu Position"
                  group="object_list"
                  prop="menu_position"
                  options={menuPositionOptions}
                />
              </div>
            </div>
          {/if}
          <FormControl type="checkbox" name="Enable Search" group="object_list" prop="enable_search" />
          <FormControl type="checkbox" name="Display Groups" group="object_list" prop="show_groups" />
          <FormControl type="checkbox" name="Group Objects by Artboard" group="object_list" prop="group_by_artboard" />
          {#if !mapSettings.object_list.group_by_artboard}
            <div transition:fade|local={{ duration: 150 }}>
              <div transition:slide|local={{ duration: 150 }}>
                <FormControl
                  type="checkbox"
                  name="Show Only Objects from Active Artboard"
                  group="object_list"
                  prop="show_only_objects_from_active_artboard"
                />
              </div>
            </div>
          {/if}
          <FormControl type="checkbox" name="Hide Static Objects" group="object_list" prop="hide_static_objects" />
        </div>
      </div>
    {/if}
  </FormSection>

  <!-- Custom Code -->
  <!-- custom_code: {
    custom_css: '',
    custom_js: ''
  }, -->
  <FormSection title="Custom Code" collapsed opacity="0.5">
    <FormControl type="textarea" label="JavaScript" group="custom_code" prop="custom_js" />
    <FormControl type="textarea" label="CSS" group="custom_code" prop="custom_css" />
    <FormControl type="checkbox" name="Preview Custom CSS" group="custom_code" prop="preview_custom_css" />
  </FormSection>

  <!-- Defaults -->
  <FormSection title="Defaults" opacity="0.5">
    <FormControl type="button" name="Edit Object Defaults" action={handleEditObjectDefaults} />
  </FormSection>
</div>
