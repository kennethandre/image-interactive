<script>
  import Toolbar from 'Editor/components/canvas/tooltip/content-builder/toolbar/toolbar'
  import ToolbarButton from 'Editor/components/canvas/tooltip/content-builder/toolbar/toolbar-button'
  import ToolbarButtonEditMode from 'Editor/components/canvas/tooltip/content-builder/toolbar/toolbar-button-edit-mode'
  import ToolbarSeparator from 'Editor/components/canvas/tooltip/content-builder/toolbar/toolbar-separator'
  import Menu from 'Editor/components/UI/menu/menu'
  import FormControl from 'Editor/components/UI/form-controls/form-control'
  import EditableContainer from 'Editor/components/canvas/tooltip/content-builder/blocks/misc/editable-container'
  import * as utilities from 'Editor/scripts/utilities'

  export let settings
  export let onEdit = () => {}
  export let toolbar
  export let inFocus
  export function createEvents() {}
  export function removeEvents() {}
  export let contentHidden

  let style
  let editableContainer
  let linkMenu
  let linkMenuUrl = ''

  $: isVisualEditMode = inFocus ? isVisualEditMode : true

  $: style = `
  font-family: ${settings.style.fontFamily};
  font-size: ${settings.style.fontSize}px;
  line-height: ${utilities.isNumber(settings.style.lineHeight) ? settings.style.lineHeight + 'px' : settings.style.lineHeight};
  color: ${settings.style.color};

  text-align: ${settings.style.textAlign};

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

  // Toolbar functions
  function insertLink() {
    linkMenu.hide()
    editableContainer.setA({ url: linkMenuUrl, useSavedRange: true })
    linkMenuUrl = ''
  }
  function setAlignLeft() {
    settings.style.textAlign = 'left'
    onEdit()
  }
  function setAlignCenter() {
    settings.style.textAlign = 'center'
    onEdit()
  }
  function setAlignRight() {
    settings.style.textAlign = 'right'
    onEdit()
  }
</script>

<div class="relative">
  <!-- Main content area -->
  <EditableContainer bind:this={editableContainer} id={settings.other.id} classes={settings.other.classes} style="{style} {settings.other.css}" bind:text={settings.text} onChange={onEdit} visualMode={isVisualEditMode} hidden={contentHidden} />

  <!-- Toolbar -->
  <div class="absolute z-20 bottom-full left-0" style="margin-left: {parseInt(settings.boxModel.margin.left) + parseInt(settings.boxModel.padding.left) - 1}px;">
    <Toolbar bind:this={toolbar}>
      <slot name="toolbar-buttons-start" />
      <ToolbarSeparator />
      <!-- Block-specific buttons -->
      <ToolbarButton icon="fa-solid fa-font" menuName="{settings.id}-menu-text-style" />
      <ToolbarButton onClick={editableContainer?.setStrong} icon="fa-solid fa-bold" disabled={!isVisualEditMode} />
      <ToolbarButton onClick={editableContainer?.setEm} icon="fa-solid fa-italic" disabled={!isVisualEditMode} />
      <ToolbarButton onClick={editableContainer?.saveRange} icon="fa-solid fa-link" menuName="{settings.id}-menu-link" disabled={!isVisualEditMode} />
      <ToolbarButton onClick={setAlignLeft} icon="fa-solid fa-align-left" />
      <ToolbarButton onClick={setAlignCenter} icon="fa-solid fa-align-center" />
      <ToolbarButton onClick={setAlignRight} icon="fa-solid fa-align-right" />
      <ToolbarButtonEditMode onClick={() => (isVisualEditMode = !isVisualEditMode)} icon="fa-solid fa-code" active={!isVisualEditMode} />
      <!-- / -->
      <ToolbarSeparator />
      <slot name="toolbar-buttons-end" />
    </Toolbar>
  </div>

  <!-- Menus -->
  <Menu name="{settings.id}-menu-text-style" classes="p-3" moveToRoot>
    <div style="width: 250px;">
      <FormControl bind:value={settings.style.fontFamily} onChange={onEdit} type="text" label="Font Family" />
      <div class="flex">
        <FormControl bind:value={settings.style.fontSize} onChange={onEdit} type="number" label="Size" />
        <FormControl bind:value={settings.style.lineHeight} onChange={onEdit} type="number" label="Line Height" />
        <FormControl bind:value={settings.style.color} onChange={onEdit} type="color" label="Color" />
      </div>
    </div>
  </Menu>
  <Menu bind:this={linkMenu} name="{settings.id}-menu-link" classes="p-3" moveToRoot>
    <div style="width: 150px;">
      <FormControl bind:value={linkMenuUrl} type="text" label="URL" small />
      <FormControl type="button" name="Done" block small style="primary" action={insertLink} />
    </div>
  </Menu>
</div>
