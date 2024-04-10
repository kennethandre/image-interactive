import { writable } from 'svelte/store'
import * as consts from 'Editor/scripts/consts'

let storedDarkMode = false
if (window.localStorage.imageMapProDarkMode === 'true' || window.localStorage.imageMapProDarkMode === true) {
  storedDarkMode = true
}

let defaults = {
  tool: consts.TOOL_SELECT,
  previewMode: false,
  darkMode: storedDarkMode,
  selected: [],
  previousSelected: [],
  hidden: [],
  hiddenTooltips: [],
  objectListVisible: true,
  objectSettingsVisible: true,
  mapSettingsVisible: false,
  clipboard: {},
  zoom: 1,
  minZoom: 1,
  maxZoom: 16,
  activeArtboard: undefined,
  lockSize: true,
  showMouseoverStylesInEditor: false
}

export let tool = writable(defaults.tool)
export let previewMode = writable(defaults.previewMode)
export let darkMode = writable(defaults.darkMode)
export let selected = writable(defaults.selected)
export let previousSelected = writable(defaults.previousSelected)
export let hidden = writable(defaults.hidden)
export let hiddenTooltips = writable(defaults.hiddenTooltips)
export let objectListVisible = writable(defaults.objectListVisible)
export let objectSettingsVisible = writable(defaults.objectSettingsVisible)
export let mapSettingsVisible = writable(defaults.mapSettingsVisible)
export let clipboard = writable(defaults.clipboard)
export let zoom = writable(defaults.zoom)
export let minZoom = writable(defaults.minZoom)
export let maxZoom = writable(defaults.maxZoom)
export let activeArtboard = writable(defaults.activeArtboard)
export let lockSize = writable(defaults.lockSize)
export let showMouseoverStylesInEditor = writable(defaults.showMouseoverStylesInEditor)

export let clear = function () {
  tool.set(defaults.tool)
  previewMode.set(defaults.previewMode)
  selected.set(defaults.selected)
  previousSelected.set(defaults.previousSelected)
  hidden.set(defaults.hidden)
  hiddenTooltips.set(defaults.hiddenTooltips)
  objectListVisible.set(defaults.objectListVisible)
  objectSettingsVisible.set(defaults.objectSettingsVisible)
  mapSettingsVisible.set(defaults.mapSettingsVisible)
  clipboard.set(defaults.clipboard)
  zoom.set(defaults.zoom)
  minZoom.set(defaults.minZoom)
  maxZoom.set(defaults.maxZoom)
  activeArtboard.set(defaults.activeArtboard)
  lockSize.set(defaults.lockSize)
  showMouseoverStylesInEditor.set(defaults.showMouseoverStylesInEditor)
}

darkMode.subscribe(v => {
  window.localStorage.imageMapProDarkMode = v
})

document.addEventListener(consts.SHORTCUT_SELECT, () => {
  tool.set(consts.TOOL_SELECT)
})
document.addEventListener(consts.SHORTCUT_SPOT, () => {
  tool.set(consts.TOOL_SPOT)
})
document.addEventListener(consts.SHORTCUT_RECT, () => {
  tool.set(consts.TOOL_RECT)
})
document.addEventListener(consts.SHORTCUT_OVAL, () => {
  tool.set(consts.TOOL_OVAL)
})
document.addEventListener(consts.SHORTCUT_POLY, () => {
  tool.set(consts.TOOL_POLY)
})
document.addEventListener(consts.SHORTCUT_TEXT, () => {
  tool.set(consts.TOOL_TEXT)
})

document.addEventListener(consts.SHORTCUT_HIDE_OBJECT_LIST, () => {
  objectListVisible.update(v => !v)
})
document.addEventListener(consts.SHORTCUT_HIDE_OBJECT_SETTINGS, () => {
  objectSettingsVisible.update(v => !v)
})