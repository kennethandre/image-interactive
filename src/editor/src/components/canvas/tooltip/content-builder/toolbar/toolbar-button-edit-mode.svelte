<script>
  export let onClick = () => {}
  export let icon = ''
  export let menuName
  export let active

  $: activeClasses = active ? 'btn btn-primary' : 'btn btn-transparent'
</script>

<div on:click={onClick} on:keypress={onClick} data-open-menu={menuName} class="flex justify-center items-center {icon} w-7 h-7 cursor-pointer select-none rounded {activeClasses}" />
