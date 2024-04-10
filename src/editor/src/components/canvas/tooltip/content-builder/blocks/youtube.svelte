<script>
  import { afterUpdate } from 'svelte'
  import Toolbar from 'Editor/components/canvas/tooltip/content-builder/toolbar/toolbar'
  import ToolbarButton from 'Editor/components/canvas/tooltip/content-builder/toolbar/toolbar-button'
  import ToolbarSeparator from 'Editor/components/canvas/tooltip/content-builder/toolbar/toolbar-separator'
  import Menu from 'Editor/components/UI/menu/menu'
  import FormControl from 'Editor/components/UI/form-controls/form-control'

  export let settings
  export let onEdit = () => {}
  export let toolbar
  export function createEvents() {}
  export function removeEvents() {}
  export let contentHidden

  $: hiddenClass = contentHidden ? 'hidden' : ''

  $: style = `
  width: ${settings.boxModel.width == 'auto' ? settings.boxModel.width : settings.boxModel.width + 'px'};
  height: ${settings.boxModel.height == 'auto' ? settings.boxModel.height : settings.boxModel.height + 'px'};

  margin-top: ${settings.boxModel.margin.top}px;
  margin-bottom: ${settings.boxModel.margin.bottom}px;
  margin-left: ${settings.boxModel.margin.left}px;
  margin-right: ${settings.boxModel.margin.right}px;

  padding-top: ${settings.boxModel.padding.top}px;
  padding-bottom: ${settings.boxModel.padding.bottom}px;
  padding-left: ${settings.boxModel.padding.left}px;
  padding-right: ${settings.boxModel.padding.right}px;
  `

  afterUpdate(() => {
    settings.embedCode = settings.embedCode.replace('allowfullscreen', '')
    if (settings.allowFullscreen && settings.embedCode.indexOf('allowfullscreen') == -1) {
      settings.embedCode = settings.embedCode.replace('></iframe>', ' allowfullscreen></iframe>')
    }
  })
</script>

<div>
  <!-- Main content area -->
  <div class="{hiddenClass} {settings.other.classes}" style="{style} {settings.other.css}" id={settings.other.id}>
    {#if settings.embedCode}
      <div class="pointer-events-none" bind:innerHTML={settings.embedCode} contenteditable="false" />
    {/if}
    {#if !settings.embedCode}
      <div class="flex items-center justify-center bg-theme-600 py-5"><div class="fa-solid fa-youtube text-white text-xl" /></div>
    {/if}
  </div>

  <!-- Toolbar -->
  <div class="absolute z-20 bottom-full left-0" style="margin-left: {parseInt(settings.boxModel.margin.left) + parseInt(settings.boxModel.padding.left) - 1}px;">
    <Toolbar bind:this={toolbar}>
      <slot name="toolbar-buttons-start" />
      <ToolbarSeparator />
      <!-- Block-specific buttons -->
      <ToolbarButton icon="fa-brands fa-youtube" menuName="{settings.id}-menu-youtube" />
      <!-- / -->
      <ToolbarSeparator />
      <slot name="toolbar-buttons-end" />
    </Toolbar>
  </div>

  <!-- Menus -->
  <Menu name="{settings.id}-menu-youtube" classes="p-3" moveToRoot>
    <div style="width: 250px;">
      <FormControl type="text" label="Embed Code" onChange={onEdit} bind:value={settings.embedCode} small />
      <FormControl type="checkbox" name="Allow Fullscreen" onChange={onEdit} bind:value={settings.allowFullscreen} small />
    </div></Menu
  >
</div>
