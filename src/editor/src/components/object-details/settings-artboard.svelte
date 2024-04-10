<script>
  import { onMount, onDestroy } from 'svelte'
  import { fade, slide } from 'svelte/transition'
  import { store, getters } from 'Editor/store'
  import { selected, lockSize } from 'Editor/store/ui'
  import * as consts from 'Editor/scripts/consts'

  import FormControl from 'Editor/components/UI/form-controls/form-control'
  import FormHeading from 'Editor/components/UI/form-controls/form-heading'

  export let visible

  let subscribers = []
  let selectedObject = undefined

  onMount(() => {
    getSelectedObject()
  })
  onDestroy(() => {
    subscribers.forEach((unsub) => unsub())
    subscribers = []
  })

  subscribers.push(
    selected.subscribe(() => {
      getSelectedObject()
    })
  )

  subscribers.push(
    store.subscribe(() => {
      getSelectedObject()
    })
  )

  function getSelectedObject() {
    selectedObject = getters.getSelectedObject()

    if (!selectedObject) {
      selectedObject = undefined
      return
    }
    if (selectedObject.type !== consts.OBJECT_ARTBOARD) {
      selectedObject = undefined
      return
    }
  }
</script>

{#if selectedObject && visible}
  <div>
    <div class="p-2">
      <FormControl type="text" label="Title" group="selected" prop="title" />
      <div class="flex {selectedObject.use_image_size ? 'opacity-50 pointer-events-none' : ''}">
        <div class="flex-1">
          <FormControl type="number" label="Width" group="selected" prop="width" />
        </div>
        <div
          class="fa-solid {$lockSize ? 'fa-lock' : 'fa-lock-open opacity-50'} cursor-pointer w-4 mx-1 h-[32px] flex items-center justify-center"
          on:click={() => {
            $lockSize = !$lockSize
          }}
          on:keypress={() => {
            $lockSize = !$lockSize
          }}
        />
        <div class="flex-1">
          <FormControl type="number" label="Height" group="selected" prop="height" />
        </div>
      </div>
      {#if selectedObject.background_type === 'image'}
        <div transition:fade|local={{ duration: 150 }}>
          <div transition:slide|local={{ duration: 150 }}>
            <FormControl type="checkbox" name="Use Background Image Size" group="selected" prop="use_image_size" />
          </div>
        </div>
      {/if}
      <FormHeading title="Background" />
      <FormControl
        type="button-group"
        label="Background Type"
        group="selected"
        prop="background_type"
        options={[
          { name: 'None', value: 'none' },
          { name: 'Color', value: 'color' },
          { name: 'Image', value: 'image' },
        ]}
      />
      {#if selectedObject.background_type === 'color'}
        <div transition:fade|local={{ duration: 150 }}>
          <div transition:slide|local={{ duration: 150 }}>
            <FormControl type="color" label="Background Color" group="selected" prop="background_color" />
          </div>
        </div>
      {/if}
      {#if selectedObject.background_type === 'image'}
        <div transition:fade|local={{ duration: 150 }}>
          <div transition:slide|local={{ duration: 150 }}>
            {#if window.imageMapProConfig.wp}
              <FormControl type="wp-image" label="Image" group="selected" prop="image_url" />
            {:else}
              <FormControl type="text" label="URL" group="selected" prop="image_url" />
            {/if}
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}
