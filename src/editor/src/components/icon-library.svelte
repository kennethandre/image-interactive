<script>
  import FormControl from 'Editor/components/UI/form-controls/form-control'
  import { onMount } from 'svelte'

  export let value
  export let onChange = () => {}

  let icons = []
  let iconsFiltered = icons
  let searchString = ''

  onMount(() => {
    let req = new Request('https://dfpyxk7hlnlki.cloudfront.net/fontawesome6-icons.json')
    fetch(req)
      .then((response) => response.json())
      .then((body) => {
        icons = body
        iconsFiltered = icons
      })
  })

  function onUpdate() {
    if (searchString.length < 2) {
      iconsFiltered = icons
      return
    }
    let filteredNames = Object.keys(icons).filter((iconName) => {
      if (iconName.indexOf(searchString) !== -1) return true
      return false
    })
    iconsFiltered = {}
    filteredNames.forEach((name) => (iconsFiltered[name] = icons[name]))
  }

  function selectIcon(e) {
    let iconName = e.target.dataset.iconName || e.target.closest('.library-icon').dataset.iconName
    let newValue = icons[iconName]

    if (newValue != value) {
      value = newValue
      onChange()
    }
  }
</script>

<div class="w-full h-full flex flex-col">
  <FormControl type="text" placeholder="Search icons" {onUpdate} bind:value={searchString} />
  {#if icons.length == 0}
    <div class="p-2">Loading icon library...</div>
  {/if}
  <div class="pretty-scroll flex flex-wrap p-2 overflow-y-auto" style="margin-right: 4px;">
    {#each Object.keys(iconsFiltered) as iconName (iconName)}
      <div data-icon-name={iconName} on:click={selectIcon} on:keypress={selectIcon} class="library-icon flex flex-col items-center justify-center m-1 p-1 w-16 h-16 btn form-control-shadow cursor-pointer rounded select-none">
        <div class="dark:fill-white fill-black w-6 h-6">
          {@html iconsFiltered[iconName]}
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  :global(.library-icon svg) {
    width: 100%;
    height: 100%;
  }
</style>
