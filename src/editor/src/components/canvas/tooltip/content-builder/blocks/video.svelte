<script>
  import Toolbar from 'Editor/components/canvas/tooltip/content-builder/toolbar/toolbar'
  import ToolbarButton from 'Editor/components/canvas/tooltip/content-builder/toolbar/toolbar-button'
  import ToolbarSeparator from 'Editor/components/canvas/tooltip/content-builder/toolbar/toolbar-separator'
  import Menu from 'Editor/components/UI/menu/menu'
  import FormControl from 'Editor/components/UI/form-controls/form-control'
  import { src_url_equal } from 'svelte/internal'

  export let settings
  export let onEdit = () => {}
  export let toolbar
  export function createEvents() {}
  export function removeEvents() {}
  export let contentHidden

  let videoIsALink = false
  let menu

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

  function onVideoIsALinkChange() {
    onEdit()
    menu.recalc()
  }
</script>

<div>
  <!-- Main content area -->
  <!-- svelte-ignore a11y-media-has-caption -->
  <div class={hiddenClass} style="{style} {settings.other.css}">
    {#if settings.src.mp4 || settings.src.webm || settings.src.ogv}
      <video autoplay={settings.autoplay} loop={settings.loop} controls={settings.controls} id={settings.other.id} class={settings.other.classes}>
        <source src={settings.src.mp4} type="video/mp4" />
        <source src={settings.src.webm} type="video/webm" />
        <source src={settings.src.ogv} type="video/ogv" />
      </video>
    {/if}
    {#if !settings.src.mp4 && !settings.src.webm && !settings.src.ogv}
      <div class="flex items-center justify-center bg-theme-600 py-5"><div class="fa-solid fa-video-camera text-white text-xl" /></div>
    {/if}
  </div>

  <!-- Toolbar -->
  <div class="absolute z-20 bottom-full left-0" style="margin-left: {parseInt(settings.boxModel.margin.left) + parseInt(settings.boxModel.padding.left) - 1}px;">
    <Toolbar bind:this={toolbar}>
      <slot name="toolbar-buttons-start" />
      <ToolbarSeparator />
      <!-- Block-specific buttons -->
      <ToolbarButton icon="fa-solid fa-video-camera" menuName="{settings.id}-menu-video" />
      <!-- / -->
      <ToolbarSeparator />
      <slot name="toolbar-buttons-end" />
    </Toolbar>
  </div>

  <!-- Menus -->
  <Menu name="{settings.id}-menu-video" classes="p-3" bind:this={menu} moveToRoot>
    <div style="width: 250px;">
      <FormControl type="text" label="WEBM URL" onChange={onEdit} bind:value={settings.src.webm} small />
      <FormControl type="text" label="MP4 URL" onChange={onEdit} bind:value={settings.src.mp4} small />
      <FormControl type="text" label="OGV URL" onChange={onEdit} bind:value={settings.src.ogv} small />
      <div class="flex">
        <FormControl type="checkbox" name="Autoplay" onChange={onEdit} bind:value={settings.autoplay} small />
        <FormControl type="checkbox" name="Controls" onChange={onEdit} bind:value={settings.controls} small />
        <FormControl type="checkbox" name="Loop" onChange={onEdit} bind:value={settings.loop} small />
      </div>
      <FormControl bind:value={videoIsALink} onChange={onVideoIsALinkChange} type="checkbox" name="Video is a Link" small />
      <FormControl bind:value={settings.linkUrl} onChange={onEdit} type="text" label="Link URL" small hidden={!videoIsALink} />
    </div>
  </Menu>
</div>
