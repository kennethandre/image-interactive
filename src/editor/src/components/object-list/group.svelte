<script>
  import { onDestroy } from 'svelte'
  import { getContext } from 'svelte'
  import { hidden, hiddenTooltips } from 'Editor/store/ui'

  export let id
  export let title
  export let selected
  export let childrenCount
  export let collapsed
  export let highlighted
  export let dragging
  export let visible
  export let single

  let subscribers = []
  let context = getContext('object-list')
  let root
  let trunk
  let icon

  // Update icons for collapsed state
  $: icon = collapsed ? 'fa-solid fa-folder' : 'fa-solid fa-folder-open'
  $: iconArrow = collapsed ? 'fa-solid fa-angle-right' : 'fa-solid fa-angle-down'

  // Update trunk height
  $: trunkHeight = visible ? childrenCount * 40 : 0

  // Update background and text color
  // according to state
  let bgClass
  let bgClass_Dark
  let bgOpacityClass
  let bgOpacityClass_Dark
  let textClass
  let textClass_Dark

  let bgTrunkClass
  let bgTrunkClass_Dark

  $: {
    // remove old classes
    root?.classList.remove(bgClass)
    root?.classList.remove(bgClass_Dark)
    root?.classList.remove(bgOpacityClass)
    root?.classList.remove(bgOpacityClass_Dark)
    root?.classList.remove(textClass)
    root?.classList.remove(textClass_Dark)

    trunk?.classList.remove(bgTrunkClass)
    trunk?.classList.remove(bgTrunkClass_Dark)

    // set default
    bgClass = 'na'
    bgClass_Dark = 'na'
    bgOpacityClass = 'na'
    bgOpacityClass_Dark = 'na'
    textClass = 'na'
    textClass_Dark = 'dark:text-white'

    bgTrunkClass = 'bg-theme-300'
    bgTrunkClass_Dark = 'dark:bg-theme-600'

    // change according to state
    if (selected) {
      bgClass = 'bg-primary-500'
      bgClass_Dark = 'dark:bg-primary-600'
      textClass = 'text-white'
      textClass_Dark = 'dark:text-white'
    }

    if (highlighted) {
      bgClass = 'bg-theme-300'
      bgClass_Dark = 'dark:bg-theme-600'
    }

    if (dragging) {
      bgOpacityClass = 'bg-opacity-0'
      bgOpacityClass_Dark = 'dark:bg-opacity-0'
      textClass = 'na'
      textClass_Dark = 'dark:text-white'

      bgTrunkClass = 'na'
      bgTrunkClass_Dark = 'na'
    }

    // apply
    root?.classList.add(bgClass)
    root?.classList.add(bgClass_Dark)
    root?.classList.add(bgOpacityClass)
    root?.classList.add(bgOpacityClass_Dark)
    root?.classList.add(textClass)
    root?.classList.add(textClass_Dark)

    trunk?.classList.add(bgTrunkClass)
    trunk?.classList.add(bgTrunkClass_Dark)
  }

  onDestroy(() => {
    subscribers.forEach((unsub) => unsub())
    subscribers = []
  })

  let isHidden = $hidden.includes(id)
  subscribers.push(
    hidden.subscribe(() => {
      isHidden = $hidden.includes(id)
    })
  )

  let isTooltipHidden = $hiddenTooltips.includes(id)
  subscribers.push(
    hiddenTooltips.subscribe(() => {
      isTooltipHidden = $hiddenTooltips.includes(id)
    })
  )

  $: hiddenTooltip = isTooltipHidden ? 'fa-solid fa-comment-slash' : 'fa-solid fa-comment opacity-20 hidden'
  $: hiddenIcon = isHidden ? 'fa-solid fa-eye-slash opacity-100' : 'fa-solid fa-eye opacity-20 hidden'
</script>

<div
  bind:this={root}
  class="
    object-list-item
    flex
    w-full
    leading-10
  "
>
  <div on:click={context.toggle(id)} on:keypress={context.toggle(id)} class="{iconArrow} shrink-0 w-10 text-center leading-10 list-item-expand-button" />
  <div class="{icon} shrink-0 w-6 leading-10" />
  <div bind:this={trunk} class="absolute w-px ml-5 mt-10 transition-all" style="height: {trunkHeight}px;" />

  <div class="whitespace-nowrap text-ellipsis overflow-hidden {single ? 'pr-8' : ''} relative" style="margin-right: 72px;">
    {title}
    {#if single}
      <div class="fa-solid fa-layer-group w-8 leading-10 text-center absolute right-0 top-0" />
    {/if}
  </div>
  <div class="list-item-tooltip-hide-icon {hiddenTooltip} w-8 leading-10 absolute right-10 cursor-pointer text-center" />
  <div class="list-item-hide-icon {hiddenIcon} w-8 leading-10 absolute right-2 cursor-pointer text-center" />
</div>

<style>
  .object-list-item:hover .list-item-hide-icon {
    display: block !important;
  }
  .object-list-item:hover .list-item-tooltip-hide-icon {
    display: block !important;
  }
</style>
