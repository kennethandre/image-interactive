<script>
  import { store, getters } from 'Editor/store'
  import { activeArtboard } from 'Editor/store/ui'
  import FormControl from 'Editor/components/UI/form-controls/form-control'
  import { onDestroy } from 'svelte'

  let subscribers = []
  let options = []

  update()

  subscribers.push(
    store.subscribe(() => {
      update()
    })
  )

  onDestroy(() => {
    subscribers.forEach((unsub) => unsub())
    subscribers = []
  })

  function update() {
    let artboards = getters.getArtboards()

    // Generate options for the select
    options = artboards.map((o) => {
      return { name: o.title, value: o.id }
    })

    // Check if there is no active artboard set
    if (!$activeArtboard) {
      $activeArtboard = artboards[0].id
    } else {
      // Check if the active artboard exists in the store
      if (options.filter((o) => o.value === $activeArtboard).length === 0) $activeArtboard = artboards[0].id
    }
  }
</script>

<div class="flex z-10 absolute -left-1 -top-10 min-w-[120px]">
  <div class="flex-1"><FormControl type="select" {options} bind:value={$activeArtboard} /></div>
</div>
