<script>
  import { onMount, getContext, onDestroy } from 'svelte'
  import * as consts from 'Editor/scripts/consts'
  import Paragraph from 'Editor/components/canvas/tooltip/content-builder/blocks/paragraph.svelte'
  import Heading from 'Editor/components/canvas/tooltip/content-builder/blocks/heading.svelte'
  import Button from 'Editor/components/canvas/tooltip/content-builder/blocks/button.svelte'
  import Image from 'Editor/components/canvas/tooltip/content-builder/blocks/image.svelte'
  import Video from 'Editor/components/canvas/tooltip/content-builder/blocks/video.svelte'
  import YouTube from 'Editor/components/canvas/tooltip/content-builder/blocks/youtube.svelte'
  import ToolbarButton from 'Editor/components/canvas/tooltip/content-builder/toolbar/toolbar-button'
  import ToolbarButtonDelete from 'Editor/components/canvas/tooltip/content-builder/toolbar/toolbar-button-delete'
  import ToolbarSeparator from 'Editor/components/canvas/tooltip/content-builder/toolbar/toolbar-separator'
  import ToolbarButtonDrag from 'Editor/components/canvas/tooltip/content-builder/toolbar/toolbar-button-drag'
  import ToolbarButtonMove from 'Editor/components/canvas/tooltip/content-builder/toolbar/toolbar-button-move'
  import Menu from 'Editor/components/UI/menu/menu'
  import FormControl from 'Editor/components/UI/form-controls/form-control'
  import BoxModel from 'Editor/components/canvas/tooltip/content-builder/toolbar/box-model/box-model'

  export let settings

  let context = getContext('content-builder')
  let root
  let block
  let toolbar
  let inFocus = false
  let contentHidden = false

  onMount(() => {
    createEvents()
  })

  onDestroy(() => {
    removeEvents()
  })

  export function setZ(v) {
    root.style.zIndex = v
    root.parentElement.style.zIndex = v
  }
  export function setTranslate({ x, y }) {
    root.style.transform = `translate(${x}px, ${y}px)`
  }
  export function clearTransform() {
    root.style.transform = ''
  }
  export function setOpacity(v) {
    root.style.opacity = parseFloat(v)
  }
  export function getOffsetTop() {
    return root.getBoundingClientRect().y
  }
  export function hideContent() {
    contentHidden = true
  }
  export function showContent() {
    contentHidden = false
  }

  function onDelete() {
    context.onDelete(settings.id)
  }
  function onEdit() {
    context.onEdit(settings.id)
  }
  function createEvents() {
    document.addEventListener('mouseup', handleMouseUp)
    block.createEvents()
  }
  function removeEvents() {
    document.removeEventListener('mouseup', handleMouseUp)
    block.removeEvents()
  }
  function handleMouseUp(e) {
    if (!e.target.closest(`[data-id="${settings.id}"]`)) {
      toolbar.hide()
      setZ(1)
      inFocus = false
    } else {
      setZ(50)
      toolbar.show()
      inFocus = true
    }
  }
  function onMoveUp() {
    context.onMoveUp(settings.id)
  }
  function onMoveDown() {
    context.onMoveDown(settings.id)
  }
  function onDragStart() {
    context.onDragStart(settings.id)
  }
</script>

<div data-id={settings.id} bind:this={root} class="relative" style="z-index: 0;">
  {#if settings.type === consts.CONTENT_BLOCK_PARAGRAPH}
    <Paragraph bind:settings bind:toolbar {inFocus} bind:this={block} {onEdit} {contentHidden}>
      <svelte:fragment slot="toolbar-buttons-start">
        <ToolbarButtonDrag {onDragStart} />
        <ToolbarButtonMove {onMoveUp} {onMoveDown} />
      </svelte:fragment>

      <svelte:fragment slot="toolbar-buttons-end">
        <ToolbarButton icon="fa-solid fa-cog" menuName="{settings.id}-menu-box-model" />
        <ToolbarButton icon="fa-solid fa-ellipsis-h" menuName="{settings.id}-menu-other" />
        <ToolbarSeparator />
        <ToolbarButtonDelete onClick={onDelete} />
      </svelte:fragment>
    </Paragraph>
  {/if}
  {#if settings.type === consts.CONTENT_BLOCK_HEADING}
    <Heading bind:settings bind:toolbar {inFocus} bind:this={block} {onEdit} {contentHidden}>
      <svelte:fragment slot="toolbar-buttons-start">
        <ToolbarButtonDrag {onDragStart} />
        <ToolbarButtonMove {onMoveUp} {onMoveDown} />
      </svelte:fragment>
      <svelte:fragment slot="toolbar-buttons-end">
        <ToolbarButton icon="fa-solid fa-cog" menuName="{settings.id}-menu-box-model" />
        <ToolbarButton icon="fa-solid fa-ellipsis-h" menuName="{settings.id}-menu-other" />
        <ToolbarSeparator />
        <ToolbarButtonDelete onClick={onDelete} />
      </svelte:fragment>
    </Heading>
  {/if}
  {#if settings.type === consts.CONTENT_BLOCK_BUTTON}
    <Button bind:settings bind:toolbar bind:this={block} {onEdit} {contentHidden}>
      <svelte:fragment slot="toolbar-buttons-start">
        <ToolbarButtonDrag {onDragStart} />
        <ToolbarButtonMove {onMoveUp} {onMoveDown} />
      </svelte:fragment>
      <svelte:fragment slot="toolbar-buttons-end">
        <ToolbarButton icon="fa-solid fa-cog" menuName="{settings.id}-menu-box-model" />
        <ToolbarButton icon="fa-solid fa-ellipsis-h" menuName="{settings.id}-menu-other" />
        <ToolbarSeparator />
        <ToolbarButtonDelete onClick={onDelete} />
      </svelte:fragment>
    </Button>
  {/if}
  {#if settings.type === consts.CONTENT_BLOCK_IMAGE}
    <Image bind:settings bind:toolbar bind:this={block} {onEdit} {contentHidden}>
      <svelte:fragment slot="toolbar-buttons-start">
        <ToolbarButtonDrag {onDragStart} />
        <ToolbarButtonMove {onMoveUp} {onMoveDown} />
      </svelte:fragment>
      <svelte:fragment slot="toolbar-buttons-end">
        <ToolbarButton icon="fa-solid fa-cog" menuName="{settings.id}-menu-box-model" />
        <ToolbarButton icon="fa-solid fa-ellipsis-h" menuName="{settings.id}-menu-other" />
        <ToolbarSeparator />
        <ToolbarButtonDelete onClick={onDelete} />
      </svelte:fragment>
    </Image>
  {/if}
  {#if settings.type === consts.CONTENT_BLOCK_VIDEO}
    <Video bind:settings bind:toolbar bind:this={block} {onEdit} {contentHidden}>
      <svelte:fragment slot="toolbar-buttons-start">
        <ToolbarButtonDrag {onDragStart} />
        <ToolbarButtonMove {onMoveUp} {onMoveDown} />
      </svelte:fragment>
      <svelte:fragment slot="toolbar-buttons-end">
        <ToolbarButton icon="fa-solid fa-cog" menuName="{settings.id}-menu-box-model" />
        <ToolbarButton icon="fa-solid fa-ellipsis-h" menuName="{settings.id}-menu-other" />
        <ToolbarSeparator />
        <ToolbarButtonDelete onClick={onDelete} />
      </svelte:fragment>
    </Video>
  {/if}
  {#if settings.type === consts.CONTENT_BLOCK_YOUTUBE}
    <YouTube bind:settings bind:toolbar bind:this={block} {onEdit} {contentHidden}>
      <svelte:fragment slot="toolbar-buttons-start">
        <ToolbarButtonDrag {onDragStart} />
        <ToolbarButtonMove {onMoveUp} {onMoveDown} />
      </svelte:fragment>
      <svelte:fragment slot="toolbar-buttons-end">
        <ToolbarButton icon="fa-solid fa-cog" menuName="{settings.id}-menu-box-model" />
        <ToolbarButton icon="fa-solid fa-ellipsis-h" menuName="{settings.id}-menu-other" />
        <ToolbarSeparator />
        <ToolbarButtonDelete onClick={onDelete} />
      </svelte:fragment>
    </YouTube>
  {/if}

  <Menu name="{settings.id}-menu-other" classes="p-3" moveToRoot>
    <FormControl bind:value={settings.other.id} onChange={onEdit} type="text" label="ID" small />
    <FormControl bind:value={settings.other.classes} onChange={onEdit} type="text" label="Classes" small />
    <FormControl bind:value={settings.other.css} onChange={onEdit} type="textarea" label="CSS" small />
  </Menu>

  <Menu name="{settings.id}-menu-box-model" classes="p-3" moveToRoot>
    <BoxModel onChange={onEdit} bind:model={settings.boxModel} />
  </Menu>
</div>
