<script>
  import { fade } from 'svelte/transition'
  import { darkMode, objectListVisible, mapSettingsVisible } from 'Editor/store/ui'
  import { getters } from 'Editor/store'
  import { save } from 'Editor/scripts/storage'
  import { exportSettings } from 'Editor/scripts/export'
  import * as consts from 'Editor/scripts/consts'
  import SidebarButton from 'Editor/components/sidebar/sidebar-button'
  import MapSettings from 'Editor/components/sidebar/map-settings'

  let root
  let defaultWidth = 80
  let fullWidth = 300
  let saving = false
  let saveDone = false
  $: width = $mapSettingsVisible ? fullWidth : defaultWidth
  $: bg = $objectListVisible ? 'bg-theme-50 dark:bg-theme-900' : 'bg-theme-100 dark:bg-theme-800'

  function toggle() {
    $mapSettingsVisible = !$mapSettingsVisible
  }
  function openExportModal() {
    let event = new Event(consts.EVENT_OPEN_EXPORT_MODAL)
    document.dispatchEvent(event)
  }
  function openPublishModal() {
    let event = new Event(consts.EVENT_OPEN_PUBLISH_MODAL)
    document.dispatchEvent(event)
  }
  function openImportModal() {
    let event = new Event(consts.EVENT_OPEN_IMPORT_MODAL)
    document.dispatchEvent(event)
  }
  function openLoadModal() {
    let event = new Event(consts.EVENT_OPEN_LOAD_MODAL)
    document.dispatchEvent(event)
  }
  function onSave() {
    saving = true
    saveDone = false
    save(exportSettings(getters.getSettings()), (success) => {
      if (success) {
        saving = false
        saveDone = true

        setTimeout(() => {
          saving = false
          saveDone = false
        }, 3000)
      }
    })
  }
  function onNew() {
    let event = new Event(consts.EVENT_OPEN_NEW_MAP_MODAL)
    document.dispatchEvent(event)
  }
</script>

<div bind:this={root} style="width: {width}px" class="relative h-full transition-all duration-150 overflow-hidden {bg} border-r border-theme-200 dark:border-theme-700">
  {#if !$mapSettingsVisible}
    <div transition:fade={{ duration: 150 }} class="absolute top-0 p-[8px] h-full flex flex-col" style="right: 0; width: {defaultWidth}px;">
      <SidebarButton label="New" icon="fa-solid fa-file" onClick={onNew} />
      {#if !saving && !saveDone}
        <SidebarButton label="Save" icon="fa-solid fa-save" onClick={onSave} />
      {/if}
      {#if saving}
        <SidebarButton label="Saving" icon="fa-solid fa-circle-notch fa-spin" />
      {/if}
      {#if saveDone}
        <SidebarButton label="Saved" icon="fa-solid fa-check" />
      {/if}
      <SidebarButton label="Load" icon="fa-solid fa-folder-open" onClick={openLoadModal} />
      <SidebarButton label="Import" onClick={openImportModal} icon="fa-solid fa-download" />
      <SidebarButton label="Export" onClick={openExportModal} icon="fa-solid fa-upload" />
      {#if !window.imageMapProConfig.wp}
        <SidebarButton label="Code" onClick={openPublishModal} icon="fa-solid fa-code" />
      {/if}
      <SidebarButton label="Settings" onClick={toggle} icon="fa-solid fa-cog" />
      <div class="flex-1" />
      <SidebarButton label={$darkMode ? 'Light' : 'Dark'} onClick={() => ($darkMode = !$darkMode)} icon="fa-solid {$darkMode ? 'fa-sun' : 'fa-moon'}" />
    </div>
  {/if}
  {#if $mapSettingsVisible}
    <div class="h-full" transition:fade={{ duration: 150 }}>
      <div class="absolute top-0 fa-solid fa-angle-left text-lg flex justify-center items-center cursor-pointer z-10" style="width: 48px; height: 48px; right: 0" on:click={toggle} on:keypress={toggle} />
      <div class="flex flex-col h-full" style="width: {width}px;">
        <div class="text-lg flex items-center pl-5 shrink-0" style="height: 48px;">Image Settings</div>
        <div class="p-2 pretty-scroll overflow-y-auto">
          <MapSettings />
        </div>
      </div>
    </div>
  {/if}
</div>
