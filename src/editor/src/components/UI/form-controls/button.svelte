<script>
  export let action = () => {}
  export let name
  export let primary = false
  export let danger = false
  export let icon
  export let id
</script>

<div data-id={id} class="btn {primary ? 'btn-primary' : ''}{danger ? 'btn-danger' : ''} form-control-border form-control-shadow rounded flex justify-center items-center px-3" style="height: 24px;" on:click={action} on:keypress={action}>
  {#if icon}
    <div class="{icon} {name ? 'mr-1' : ''} text-center" />
  {/if}
  {#if name}
    {name}
  {/if}
</div>
