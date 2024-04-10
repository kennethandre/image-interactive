<script>
  export let onClick = () => {}
  export let icon = ''
  export let menuName
  export let disabled

  $: disabledClass = disabled ? 'btn-disabled' : ''
  $: menuNameDisabled = disabled ? '' : menuName

  function onMousedown(e) {
    e.preventDefault()
    return false
  }
</script>

<div on:click={onClick} on:keypress={onClick} on:mousedown={onMousedown} data-open-menu={menuNameDisabled} class="w-7 h-7 flex justify-center items-center btn btn-transparent rounded {disabledClass} select-none">
  <div class="{icon} w-full h-full text-inherit flex justify-center items-center pointer-events-none" />
</div>
