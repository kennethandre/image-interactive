<script>
  export let onMoveUp = () => {}
  export let onMoveDown = () => {}
</script>

<div class="w-7 h-7 flex flex-col">
  <div class="w-full h-1/2 flex justify-center items-end cursor-pointer btn btn-transparent rounded" on:click={onMoveUp} on:keypress={onMoveUp}>
    <div class="fa-solid fa-angle-up text-inherit" />
  </div>
  <div class="w-full h-1/2 flex justify-center items-start cursor-pointer btn btn-transparent rounded" on:click={onMoveDown} on:keypress={onMoveDown}>
    <div class="fa-solid fa-angle-down text-inherit" />
  </div>
</div>

<style>
</style>
