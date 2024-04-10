<script>
  export let icon = undefined
  export let title = ''
  export let onClick = () => {}
  export let small = false

  $: iconHiddenClass = icon !== undefined ? '' : 'hidden'
  $: paddingLeftClass = icon !== undefined ? '' : 'pl-4'
  $: iconSize = small ? 'w-8 h-8' : 'w-10 h-10'
  $: textSize = small ? 'h-8 text-xs' : 'h-10 text-sm'
</script>

<div on:click={onClick} on:keypress={onClick} class="menu-option flex select-none btn btn-transparent">
  <div class="{icon} {iconHiddenClass} {iconSize} flex justify-center items-center text-inherit" />
  <div class="flex items-center {textSize} pr-4 {paddingLeftClass} text-inherit">{title}</div>
</div>
