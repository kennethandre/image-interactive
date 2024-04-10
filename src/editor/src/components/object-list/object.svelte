<script>
  import { onDestroy } from 'svelte'
  import { hidden, hiddenTooltips } from 'Editor/store/ui'

  export let id
  export let title
  export let type
  export let selected
  export let dragging

  let subscribers = []
  let root
  let icon

  // Set icon
  switch (type) {
    case 'spot':
      icon = 'fa-solid fa-location-dot'
      break
    case 'rect':
      icon = 'fa-solid fa-vector-square'
      break
    case 'oval':
      icon = 'fa-solid fa-circle-notch'
      break
    case 'poly':
      icon = 'fa-solid fa-draw-polygon'
      break
    case 'svg':
      icon = 'fa-solid fa-code'
      break
    case 'svg-single':
      icon = 'fa-solid fa-code'
      break
    case 'text':
      icon = 'fa-solid fa-font'
      break
    default:
      icon = 'fa-solid fa-square'
  }

  // Update background and text color
  // according to state
  let bgClass
  let bgClass_Dark
  let bgOpacityClass
  let bgOpacityClass_Dark
  let textClass
  let textClass_Dark

  $: {
    // remove old classes
    root?.classList.remove(bgClass)
    root?.classList.remove(bgClass_Dark)
    root?.classList.remove(bgOpacityClass)
    root?.classList.remove(bgOpacityClass_Dark)
    root?.classList.remove(textClass)
    root?.classList.remove(textClass_Dark)

    // set default
    bgClass = 'na'
    bgClass_Dark = 'na'
    bgOpacityClass = 'na'
    bgOpacityClass_Dark = 'na'
    textClass = 'na'
    textClass_Dark = 'dark:text-white'

    // change according to state
    if (selected) {
      bgClass = 'bg-primary-500'
      bgClass_Dark = 'dark:bg-primary-600'
      textClass = 'text-white'
      textClass_Dark = 'dark:text-white'
    }

    if (dragging) {
      bgOpacityClass = 'bg-opacity-0'
      bgOpacityClass_Dark = 'dark:bg-opacity-0'
      textClass = 'na'
      textClass_Dark = 'dark:text-white'
    }

    // apply
    root?.classList.add(bgClass)
    root?.classList.add(bgClass_Dark)
    root?.classList.add(bgOpacityClass)
    root?.classList.add(bgOpacityClass_Dark)
    root?.classList.add(textClass)
    root?.classList.add(textClass_Dark)
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
    relative
  "
>
  <div class="{icon} shrink-0 w-6 ml-10 leading-10 text-center" />
  <div class="whitespace-nowrap text-ellipsis overflow-hidden" style="margin-right: 72px;">
    {title}
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
