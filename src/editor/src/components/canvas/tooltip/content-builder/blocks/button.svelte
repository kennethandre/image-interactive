<script>
  import Toolbar from 'Editor/components/canvas/tooltip/content-builder/toolbar/toolbar'
  import ToolbarButton from 'Editor/components/canvas/tooltip/content-builder/toolbar/toolbar-button'
  import ToolbarSeparator from 'Editor/components/canvas/tooltip/content-builder/toolbar/toolbar-separator'
  import Menu from 'Editor/components/UI/menu/menu'
  import FormControl from 'Editor/components/UI/form-controls/form-control'

  export let settings
  export let onEdit = () => {}
  export function createEvents() {}
  export function removeEvents() {}
  export let toolbar
  export let contentHidden

  $: hiddenClass = contentHidden ? 'hidden' : ''

  $: style = `
  background-color: ${settings.style.backgroundColor};
  border-radius: ${settings.style.borderRadius}px;

  font-family: ${settings.style.fontFamily};
  font-weight: ${settings.style.fontWeight};
  font-size: ${settings.style.fontSize}px;
  line-height: ${settings.boxModel.height}px;
  color: ${settings.style.color} !important;

  width: ${settings.boxModel.width == 'auto' ? settings.boxModel.width : settings.boxModel.width + 'px'};
  height: ${settings.boxModel.height == 'auto' ? settings.boxModel.height : settings.boxModel.height + 'px'};

  display: ${settings.style.display};

  text-align: center;
  pointer-events: none;
  padding: 0 20px;
  `

  $: wrapStyle = `
    margin-top: ${settings.boxModel.margin.top}px;
    margin-bottom: ${settings.boxModel.margin.bottom}px;
    margin-left: ${settings.boxModel.margin.left}px;
    margin-right: ${settings.boxModel.margin.right}px;

    padding-top: ${settings.boxModel.padding.top}px;
    padding-bottom: ${settings.boxModel.padding.bottom}px;
    padding-left: ${settings.boxModel.padding.left}px;
    padding-right: ${settings.boxModel.padding.right}px;
  `
</script>

<div>
  <!-- Main content area -->
  <div style={wrapStyle} class={hiddenClass}>
    <a href={settings.url} style="{style} {settings.other.css}" id={settings.other.id} class={settings.other.classes}>{settings.text}</a>
  </div>

  <!-- Toolbar -->
  <div class="absolute z-20 bottom-full left-0" style="margin-left: {parseInt(settings.boxModel.margin.left) + parseInt(settings.boxModel.padding.left) - 1}px;">
    <Toolbar bind:this={toolbar}>
      <slot name="toolbar-buttons-start" />
      <ToolbarSeparator />
      <!-- Block-specific buttons -->
      <ToolbarButton icon="fa-solid fa-paint-brush" menuName="{settings.id}-menu-style" />
      <ToolbarButton icon="fa-solid fa-link" menuName="{settings.id}-menu-button-url" />
      <ToolbarButton icon="fa-solid fa-code" menuName="{settings.id}-menu-button-script" />
      <!-- / -->
      <ToolbarSeparator />
      <slot name="toolbar-buttons-end" />
    </Toolbar>
  </div>

  <!-- Menus -->
  <Menu name="{settings.id}-menu-button-url" classes="p-3" moveToRoot>
    <div style="width: 250px;">
      <FormControl type="text" bind:value={settings.text} onChange={onEdit} label="Text" small />
      <FormControl type="text" bind:value={settings.url} onChange={onEdit} label="URL" small />
      <FormControl type="checkbox" name="Open Link in New Tab" bind:value={settings.newTab} onChange={onEdit} small />
    </div>
  </Menu>

  <Menu name="{settings.id}-menu-button-script" classes="p-3" moveToRoot>
    <div style="width: 250px;">
      <FormControl type="textarea" bind:value={settings.script} onChange={onEdit} label="Script" small />
    </div>
  </Menu>

  <Menu name="{settings.id}-menu-style" classes="p-3" moveToRoot>
    <div style="width: 250px;">
      <FormControl
        type="select"
        label="Display"
        small
        options={[
          { name: 'Block', value: 'block' },
          { name: 'Inline-Block', value: 'inline-block' },
        ]}
        bind:value={settings.style.display}
        {onEdit}
      />
      <div class="flex">
        <FormControl onChange={onEdit} type="number" label="Border Radius" bind:value={settings.style.borderRadius} small flex="2" />
        <FormControl onChange={onEdit} type="color" bind:value={settings.style.backgroundColor} label="BG Color" small flex="1" />
      </div>
    </div>
    <div style="width: 250px;">
      <FormControl onChange={onEdit} bind:value={settings.style.fontFamily} type="text" label="Font Family" flex="1" small />
      <div class="flex">
        <FormControl onChange={onEdit} bind:value={settings.style.fontWeight} type="number" label="Weight" flex="1" small />
        <FormControl onChange={onEdit} bind:value={settings.style.fontSize} type="number" label="Size" flex="1" small />
        <FormControl onChange={onEdit} bind:value={settings.style.color} type="color" label="Color" flex="1" small />
      </div>
    </div>
  </Menu>
</div>
