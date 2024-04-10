<script>
  import { activeArtboard } from 'Editor/store/ui'
  import { store, getters } from 'Editor/store'
  import { onDestroy } from 'svelte'
  import * as consts from 'Editor/scripts/consts'

  let subscribers = []
  let artboard = getters.getObject($activeArtboard)

  onDestroy(() => {
    subscribers.forEach((unsub) => unsub())
    subscribers = []
  })

  subscribers.push(
    activeArtboard.subscribe(() => {
      artboard = getters.getObject($activeArtboard)
    })
  )
  subscribers.push(
    store.subscribe(() => {
      artboard = getters.getObject($activeArtboard)
    })
  )
</script>

{#if artboard}
  {#if artboard.background_type === 'image' && artboard.image_url}
    <img class="w-full h-full absolute left-0 top-0 z-0 pointer-events-none" src={artboard.image_url} alt="" data-object-type={consts.CANVAS_BACKGROUND} />
  {/if}
  {#if artboard.background_type === 'color'}
    <div class="w-full h-full absolute left-0 top-0 z-0 pointer-events-none" style="background: {artboard.background_color}" data-object-type={consts.CANVAS_BACKGROUND} />
  {/if}
{/if}
