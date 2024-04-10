<script>
  import { getContext } from 'svelte'

  export let id
  export let title
  export let selected
  export let collapsed
  export let highlighted
  export let dragging

  let context = getContext('object-list')
  let root
  let icon

  // Update icon for collapsed state
  $: icon = collapsed ? 'fa-solid fa-angle-right' : 'fa-solid fa-angle-down'

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
    root?.classList.remove(bgOpacityClass)
    root?.classList.remove(textClass)
    root?.classList.remove(bgClass_Dark)
    root?.classList.remove(bgOpacityClass_Dark)
    root?.classList.remove(textClass_Dark)

    // set default
    bgClass = 'bg-theme-200'
    bgClass_Dark = 'dark:bg-theme-700'
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

    if (highlighted) {
      bgClass = 'bg-theme-300'
      bgClass_Dark = 'dark:bg-theme-600'
    }

    if (dragging) {
      bgOpacityClass = 'bg-opacity-0'
      bgOpacityClass_Dark = 'dark:bg-opacity-0'
      textClass = 'na'
      textClass_Dark = 'dark:text-white'
    }

    // apply
    root?.classList.add(bgClass)
    root?.classList.add(bgOpacityClass)
    root?.classList.add(textClass)
    root?.classList.add(bgClass_Dark)
    root?.classList.add(bgOpacityClass_Dark)
    root?.classList.add(textClass_Dark)
  }
</script>

<div
  bind:this={root}
  class="
    flex
    w-full
    leading-10
  "
>
  <div on:click={context.toggle(id)} on:keypress={context.toggle(id)} class="{icon} shrink-0 w-10 text-center leading-10 list-item-expand-button opacity-50" />
  <div class="shrink-0 fa-regular fa-note-sticky w-6 leading-10 opacity-50" />
  <div class="flex-1 whitespace-nowrap text-ellipsis overflow-hidden font-bold opacity-50">
    {title}
  </div>
</div>
