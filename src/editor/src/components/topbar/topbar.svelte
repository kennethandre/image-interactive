<script>
  import { onDestroy } from 'svelte'
  import { store, getters } from 'Editor/store'
  import { tool, previewMode, darkMode, objectListVisible, objectSettingsVisible } from 'Editor/store/ui'
  import * as consts from 'Editor/scripts/consts'
  import TopbarButton from 'Editor/components/topbar/topbar-button'
  import TopbarSeparator from 'Editor/components/topbar/topbar-separator'
  import TopbarSpacer from 'Editor/components/topbar/topbar-spacer'

  let subscribers = []
  let canUndo = getters.getCanUndo()
  let canRedo = getters.getCanRedo()

  onDestroy(() => {
    subscribers.forEach((unsub) => unsub())
    subscribers = []
  })

  subscribers.push(
    store.subscribe(() => {
      canUndo = getters.getCanUndo()
      canRedo = getters.getCanRedo()
    })
  )

  function undo() {
    const event = new Event(consts.EVENT_UNDO)
    document.dispatchEvent(event)
  }
  function redo() {
    const event = new Event(consts.EVENT_REDO)
    document.dispatchEvent(event)
  }
  function openImportSVGModal() {
    let event = new Event(consts.EVENT_OPEN_SVG_IMPORT_MODAL)
    document.dispatchEvent(event)
  }
</script>

<div class="border-b border-theme-200 bg-theme-100 dark:border-theme-700 dark:bg-theme-800" style="height: 64px;">
  <div class="flex h-full px-2 items-center">
    <TopbarButton label="" icon="fa-solid fa-arrow-pointer" onClick={() => ($tool = consts.TOOL_SELECT)} active={$tool === consts.TOOL_SELECT} tooltip="Select Objects" shortcut={['V']} />
    <TopbarSeparator />
    <TopbarButton label="Spot" icon="fa-solid fa-location-dot" onClick={() => ($tool = consts.TOOL_SPOT)} active={$tool === consts.TOOL_SPOT} tooltip="Draw Spot" shortcut={['S']} />
    <TopbarButton label="Rect" icon="fa-solid fa-vector-square" onClick={() => ($tool = consts.TOOL_RECT)} active={$tool === consts.TOOL_RECT} tooltip="Draw Rectangle" shortcut={['R']} />
    <TopbarButton label="Ellipse" icon="fa-solid fa-circle-notch" onClick={() => ($tool = consts.TOOL_OVAL)} active={$tool === consts.TOOL_OVAL} tooltip="Draw Ellipse" shortcut={['E']} />
    <TopbarButton label="Poly" icon="fa-solid fa-draw-polygon" onClick={() => ($tool = consts.TOOL_POLY)} active={$tool === consts.TOOL_POLY} tooltip="Draw Polygon" shortcut={['P']} />
    <TopbarButton label="Text" icon="fa-solid fa-font" onClick={() => ($tool = consts.TOOL_TEXT)} active={$tool === consts.TOOL_TEXT} tooltip="Draw Text" shortcut={['T']} />
    <TopbarButton label="SVG" icon="fa-solid fa-code" onClick={openImportSVGModal} tooltip="Import SVG" />
    <TopbarSeparator />
    <TopbarButton label="" icon="fa-solid fa-hand" onClick={() => ($tool = consts.TOOL_DRAG)} active={$tool === consts.TOOL_DRAG} tooltip="Pan Canvas" shortcut={['SPACE']} />
    <TopbarButton label="" icon="fa-solid fa-magnifying-glass-plus" onClick={() => ($tool = consts.TOOL_ZOOM_IN)} active={$tool === consts.TOOL_ZOOM_IN} tooltip="Zoom In" shortcut={['CTRL', '+']} />
    <TopbarButton label="" icon="fa-solid fa-magnifying-glass-minus" onClick={() => ($tool = consts.TOOL_ZOOM_OUT)} active={$tool === consts.TOOL_ZOOM_OUT} tooltip="Zoom Out" shortcut={['CTRL', '-']} />
    <TopbarButton label="1:1" icon="" event={consts.EVENT_CANVAS_RESET} tooltip="Reset Zoom & Pan" shortcut={['CTRL', '0']} />
    <TopbarSeparator />
    <TopbarButton label="" icon="" onClick={() => ($objectListVisible = !$objectListVisible)} tooltip="Toggle Object List" shortcut={['CTRL', 'ALT', '1']}>
      <div class="w-[20px] h-[20px] my-1 border rounded flex border-theme-800 dark:border-theme-100">
        <div class="w-1/3 m-px bg-theme-800 dark:bg-theme-100 rounded-sm" />
      </div>
    </TopbarButton>
    <TopbarButton label="" icon="" onClick={() => ($objectSettingsVisible = !$objectSettingsVisible)} tooltip="Toggle Object Settings" shortcut={['CTRL', 'ALT', '2']}>
      <div class="w-[20px] h-[20px] my-1 border rounded flex flex-row-reverse border-theme-800 dark:border-theme-100">
        <div class="w-1/3 m-px bg-theme-800 dark:bg-theme-100 rounded-sm" />
      </div>
    </TopbarButton>
    <TopbarSpacer />
    <TopbarButton label="" icon="fa-solid fa-undo" onClick={undo} disabled={!canUndo} tooltip="Undo" shortcut={['CTRL', 'Z']} />
    <TopbarButton label="" icon="fa-solid fa-redo" onClick={redo} disabled={!canRedo} tooltip="Redo" shortcut={['CTRL', 'Y']} />
    <TopbarButton label="Preview" icon="fa-solid fa-play" onClick={() => ($previewMode = !$previewMode)} primary shortcut={['CTRL', 'P']} danger={$previewMode ? true : false} fullOpacity />
  </div>
</div>
