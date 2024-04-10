<script>
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

  let imageIsALink = false
  let menu

  $: hiddenClass = contentHidden ? 'hidden' : ''

  $: style = `
  width: ${settings.boxModel.width == 'auto' ? settings.boxModel.width : settings.boxModel.width + 'px'};
  height: ${settings.boxModel.height == 'auto' ? settings.boxModel.height : settings.boxModel.height + 'px'};

  max-width: 100%;

  margin-top: ${settings.boxModel.margin.top}px;
  margin-bottom: ${settings.boxModel.margin.bottom}px;
  margin-left: ${settings.boxModel.margin.left}px;
  margin-right: ${settings.boxModel.margin.right}px;

  padding-top: ${settings.boxModel.padding.top}px;
  padding-bottom: ${settings.boxModel.padding.bottom}px;
  padding-left: ${settings.boxModel.padding.left}px;
  padding-right: ${settings.boxModel.padding.right}px;
  `

  function onImageIsALinkChange() {
    onEdit()
    menu.recalc()
  }
</script>

<div>
  <!-- Main content area -->
  <div style="{style} {settings.other.css}" class={hiddenClass}>
    {#if settings.url !== ''}
      <img src={settings.url} style="width: 100%" id={settings.other.id} class={settings.other.classes} alt="" />
    {/if}
    {#if !settings.url}
      <div class="flex items-center justify-center bg-theme-600 py-5"><div class="fa-solid fa-image text-white text-xl" /></div>
    {/if}
  </div>

  <!-- Toolbar -->
  <div class="absolute z-20 bottom-full left-0" style="margin-left: {parseInt(settings.boxModel.margin.left) + parseInt(settings.boxModel.padding.left) - 1}px;">
    <Toolbar bind:this={toolbar}>
      <slot name="toolbar-buttons-start" />
      <ToolbarSeparator />
      <!-- Block-specific buttons -->
      <ToolbarButton icon="fa-solid fa-image" menuName="{settings.id}-menu-image" />
      <!-- / -->
      <ToolbarSeparator />
      <slot name="toolbar-buttons-end" />
    </Toolbar>
  </div>

  <!-- Menus -->
  <Menu name="{settings.id}-menu-image" classes="p-3" bind:this={menu} moveToRoot>
    <div style="width: 250px;">
      {#if window.imageMapProConfig.wp}
        <FormControl bind:value={settings.url} onChange={onEdit} type="wp-image" label="Image" small />
      {:else}
        <FormControl bind:value={settings.url} onChange={onEdit} type="text" label="Image URL" small />
      {/if}
      <FormControl bind:value={imageIsALink} onChange={onImageIsALinkChange} type="checkbox" name="Image is a Link" small />
      <FormControl bind:value={settings.linkUrl} onChange={onEdit} type="text" label="Link URL" small hidden={!imageIsALink} />
    </div>
  </Menu>
</div>
