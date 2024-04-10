<script>
  import { darkMode, objectListVisible, objectSettingsVisible, activeArtboard, previewMode } from 'Editor/store/ui'
  import { getLastSave } from 'Editor/scripts/storage'
  import { setters } from 'Editor/store'
  import { importSettings } from 'Editor/scripts/import'
  import Topbar from 'Editor/components/topbar/topbar'
  import Sidebar from 'Editor/components/sidebar/sidebar'
  import ObjectList from 'Editor/components/object-list/list'
  import Main from 'Editor/components/main'
  import ObjectDetails from 'Editor/components/object-details/details'

  import ImportSVG from 'Editor/components/modals/import-svg'
  import Export from 'Editor/components/modals/export'
  import Publish from 'Editor/components/modals/publish'
  import Import from 'Editor/components/modals/import'
  import Load from 'Editor/components/modals/load'
  import IconLibrary from 'Editor/components/modals/icon-library'
  import ObjectDefaults from 'Editor/components/modals/object-defaults'
  import ContextMenu from 'Editor/components/context-menu'
  import BugReport from 'Editor/components/modals/bug-report'
  import ExecuteAction from 'Editor/components/modals/execute-action'
  import NewMap from 'Editor/components/modals/new-map'
  import Tooltip from 'Editor/components/canvas/tooltip/tooltip'

  import 'Editor/scripts/keyboard-shortcuts'

  // Dark Mode
  $: darkModeClass = $darkMode ? 'dark' : ''

  // Sizes
  let objectListWidth = 275
  let objectSettingsWidth = 275
  let loading = true

  getLastSave((save) => {
    loading = false
    if (save) {
      save = importSettings(save)
      setters.setMapValues(save, true)
      setters.clearHistory()
      $activeArtboard = save.artboards[0].id
    }
  })
</script>

<div class="{darkModeClass} h-full">
  {#if loading}
    <div class="absolute left-0 top-0 z-50 w-full h-full flex items-center justify-center bg-theme-100 bg-opacity-70 dark:bg-theme-900 dark:bg-opacity-80">
      <div class="fa-solid fa-circle-notch fa-spin text-2xl text-black dark:text-white" />
    </div>
  {/if}
  <div id="imp-app" class="flex h-full dark:bg-theme-900">
    <!-- Modals -->
    <ImportSVG />
    <Import />
    <Export />
    <Publish />
    <Load />
    <IconLibrary />
    <ObjectDefaults />
    <BugReport />
    <ExecuteAction />
    <NewMap />
    {#if !$previewMode} <Tooltip /> {/if}

    <!-- Context Menu -->
    <ContextMenu />

    <!-- Main -->
    <div class="flex-shrink-0 z-10">
      <Sidebar />
    </div>
    <div class="flex-shrink-0 relative overflow-hidden transition-all duration-150" style="width: {$objectListVisible ? objectListWidth : 0}px">
      <div class="z-10 h-full absolute right-0" style="width: {objectListWidth}px">
        <ObjectList />
      </div>
    </div>
    <div class="flex-1 flex flex-col h-full">
      <div class="z-10">
        <Topbar />
      </div>
      <div class="flex flex-1 min-h-0">
        <div class="flex w-full flex-grow-0">
          <div class="flex-1 relative z-0">
            <Main />
          </div>
          <div class="relative overflow-hidden transition-all z-0" style="width: {$objectSettingsVisible ? objectSettingsWidth : 0}px">
            <div class="flex-shrink-0 z-10 h-full absolute left-0" style="width: {objectSettingsWidth}px;">
              <ObjectDetails />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
