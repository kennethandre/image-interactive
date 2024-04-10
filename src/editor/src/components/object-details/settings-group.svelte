<script>
  import { onMount, onDestroy } from 'svelte'
  import { fade, slide } from 'svelte/transition'
  import { store, getters } from 'Editor/store'
  import { selected, showMouseoverStylesInEditor } from 'Editor/store/ui'
  import * as consts from 'Editor/scripts/consts'

  import FormControl from 'Editor/components/UI/form-controls/form-control'
  import FormSection from 'Editor/components/UI/form-controls/form-section'

  import TooltipSettings from 'Editor/components/canvas/tooltip/tooltip-settings'

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
    if (selectedObject.type !== consts.OBJECT_GROUP) {
      selectedObject = undefined
      return
    }
  }
</script>

{#if selectedObject && visible}
  <div>
    <div class="p-2">
      <FormControl type="text" label="Title" group="selected" prop="title" />
      <FormControl type="checkbox" name="Single Object" group="selected" prop="single_object" description="If enabled, the group will act as a single object on mouseover and will have its own tooltip and actions." />

      {#if selectedObject.single_object}
        <div transition:fade|local={{ duration: 150 }}>
          <div transition:slide|local={{ duration: 150 }}>
            <FormControl type="checkbox" name="Static" group="selected" prop="static" description="If enabled, the object will not respond to mouse events and will not show its tooltip." />
          </div>
        </div>
      {/if}

      {#if !selectedObject.static && selectedObject.single_object}
        <div transition:fade|local={{ duration: 150 }}>
          <div transition:slide|local={{ duration: 150 }}>
            <FormSection title="Styles">
              <FormControl type="filters" label="Filters" group="selected" prop="default_style.filters" />
            </FormSection>
            <FormSection title="Mouseover Styles" collapsed>
              <FormControl type="checkbox" name="Display in Editor" bind:value={$showMouseoverStylesInEditor} />
              <FormControl type="filters" label="Filters" group="selected" prop="mouseover_style.filters" />
            </FormSection>
            <FormSection title="Tooltip" collapsed>
              <FormControl type="checkbox" name="Enable Tooltip" group="selected" prop="tooltip.enable_tooltip" />
              {#if selectedObject.tooltip.enable_tooltip}
                <div transition:fade|local={{ duration: 150 }}>
                  <div transition:slide|local={{ duration: 150 }}>
                    <TooltipSettings />
                  </div>
                </div>
              {/if}
            </FormSection>
            <FormSection title="Actions" collapsed>
              <FormControl
                type="select"
                label="Click Action"
                group="selected"
                prop="actions.click"
                options={[
                  { name: 'No Action', value: 'no-action' },
                  { name: 'Run Script', value: 'run-script' },
                  { name: 'Follow Link', value: 'follow-link' },
                ]}
              />
              {#if selectedObject.actions.click === 'run-script'}
                <div transition:fade|local={{ duration: 150 }}>
                  <div transition:slide|local={{ duration: 150 }}>
                    <FormControl type="textarea" label="Script to Run" group="selected" prop="actions.script" />
                  </div>
                </div>
              {/if}
              {#if selectedObject.actions.click === 'follow-link'}
                <div transition:fade|local={{ duration: 150 }}>
                  <div transition:slide|local={{ duration: 150 }}>
                    <FormControl type="text" label="URL" group="selected" prop="actions.link" />
                  </div>
                </div>
              {/if}
              {#if selectedObject.actions.click === 'follow-link'}
                <div transition:fade|local={{ duration: 150 }}>
                  <div transition:slide|local={{ duration: 150 }}>
                    <FormControl type="checkbox" name="Open in New Window" group="selected" prop="actions.open_link_in_new_window" />
                  </div>
                </div>
              {/if}
            </FormSection>
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}
