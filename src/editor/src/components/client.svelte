<script>
  import 'Client/../dist/main.js'
  import { exportSettings } from 'Editor/scripts/export'
  import { getters, store } from 'Editor/store'
  import { previewMode, objectListVisible, objectSettingsVisible, mapSettingsVisible } from 'Editor/store/ui'
  import { onDestroy, onMount } from 'svelte'

  let subscribers = []
  let root
  // This is necessary because the UI subscribers fire when the component mounts
  // no idea why
  let justMounted = false

  onMount(() => {
    justMounted = true
    launch()
    setTimeout(() => {
      justMounted = false
    }, 250)
  })

  onDestroy(() => {
    // if (window.ImageMapPro.instances[getters.getSettings().general.name]) {
    //   window.ImageMapPro.instances[getters.getSettings().general.name].deinit()
    // }

    subscribers.forEach((unsub) => unsub())
    subscribers = []
  })

  subscribers.push(
    store.subscribe(() => {
      launch()
    })
  )
  subscribers.push(
    objectListVisible.subscribe(() => {
      if (window.ImageMapPro.instances[getters.getSettings().general.name]) {
        window.ImageMapPro.instances[getters.getSettings().general.name].deinit()
      }
      setTimeout(() => {
        if (!justMounted) launch()
      }, 250)
    })
  )
  subscribers.push(
    objectSettingsVisible.subscribe(() => {
      if (window.ImageMapPro.instances[getters.getSettings().general.name]) {
        window.ImageMapPro.instances[getters.getSettings().general.name].deinit()
      }
      setTimeout(() => {
        if (!justMounted) launch()
      }, 250)
    })
  )
  subscribers.push(
    mapSettingsVisible.subscribe(() => {
      if (window.ImageMapPro.instances[getters.getSettings().general.name]) {
        window.ImageMapPro.instances[getters.getSettings().general.name].deinit()
      }
      setTimeout(() => {
        if (!justMounted) launch()
      }, 250)
    })
  )

  function launch() {
    if (!$previewMode) {
      return
    }

    if (window.ImageMapPro.instances[getters.getSettings().general.name]) {
      window.ImageMapPro.instances[getters.getSettings().general.name].deinit()
    }

    let exported = exportSettings(getters.getSettings())

    // Make sure that the image is not taller than the parent element
    let rootWidth = root.getBoundingClientRect().width
    let rootHeight = root.getBoundingClientRect().height
    let rootRatio = rootWidth / rootHeight

    exported.artboards.forEach((artboard) => {
      let artboardWidth = artboard.width || 848
      let artboardHeight = artboard.height || 480
      let artboardRatio = artboardWidth / artboardHeight

      if (artboardWidth > rootWidth || artboardHeight > rootHeight) {
        if (artboardRatio > rootRatio) {
          artboard.width = rootWidth
          artboard.height = rootWidth / artboardRatio
        } else {
          artboard.height = rootHeight
          artboard.width = rootHeight * artboardRatio
        }
      }
    })

    // Disable responsiveness
    exported.general.responsive = false

    window.ImageMapPro.init('#imagemappro-client', exported)
  }
</script>

<div class="p-[40px] w-full h-full">
  <div class="flex w-full h-full items-center justify-center" bind:this={root}>
    <div id="imagemappro-client" />
  </div>
</div>
