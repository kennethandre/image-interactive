<script>
  import FormControl from 'Editor/components/UI/form-controls/form-control'
  import * as utilities from 'Editor/scripts/utilities'
  import { afterUpdate } from 'svelte'
  import { slide, fade } from 'svelte/transition'

  /*
    filter: blur(5px);
    filter: brightness(0.4);
    filter: contrast(200%);
    filter: drop-shadow(16px 16px 20px blue);
    filter: grayscale(50%);
    filter: hue-rotate(90deg);
    filter: invert(75%);
    filter: opacity(25%);
    filter: saturate(30%);
    filter: sepia(60%);
  */

  let filterTypes = [
    { name: 'blur', value: 'blur' },
    { name: 'brightness', value: 'brightness' },
    { name: 'contrast', value: 'contrast' },
    { name: 'drop-shadow', value: 'drop-shadow' },
    { name: 'grayscale', value: 'grayscale' },
    { name: 'hue-rotate', value: 'hue-rotate' },
    { name: 'invert', value: 'invert' },
    { name: 'opacity', value: 'opacity' },
    { name: 'saturate', value: 'saturate' },
    { name: 'sepia', value: 'sepia' },
  ]

  let attachmentForFilter = {
    blur: 'px',
    brightness: '',
    contrast: '%',
    'drop-shadow': '',
    grayscale: '%',
    'hue-rotate': 'deg',
    invert: '%',
    opacity: '%',
    saturate: '%',
    sepia: '%',
  }

  export let value = []
  export let onChange = () => {}
  export let onUpdate = () => {}
  export let label

  afterUpdate(() => {
    value = value || []
  })

  function addFilter() {
    value.push({
      id: utilities.uuidv4(),
      name: 'blur',
      value: '',
    })
    value = value
    onChange()
    onUpdate()
  }
  function deleteFilter(e) {
    let index = e.target.closest('.form-control-filter').dataset.filterIndex
    value.splice(index, 1)
    value = value
    onChange()
    onUpdate()
  }
</script>

<div>
  <div class="mb-2">{label}</div>
  <div class="-m-1">
    {#if value}
      {#each value as filter, index (filter.id)}
        <div transition:slide={{ duration: 250 }}>
          <div class="flex form-control-filter" data-filter-index={index} transition:fade={{ duration: 250 }}>
            <div class="flex-[2]"><FormControl type="select" bind:value={filter.name} options={filterTypes} {onChange} {onUpdate} /></div>
            <div class="flex-[2]"><FormControl type="text" bind:value={filter.value} attachment={attachmentForFilter[filter.name]} {onChange} {onUpdate} /></div>
            <div class="flex-1"><FormControl type="button" action={deleteFilter} icon="fa-solid fa-trash" /></div>
          </div>
        </div>
      {/each}
    {/if}
    <FormControl type="button" name="Add Filter" icon="fa-solid fa-plus" action={addFilter} />
  </div>
</div>
