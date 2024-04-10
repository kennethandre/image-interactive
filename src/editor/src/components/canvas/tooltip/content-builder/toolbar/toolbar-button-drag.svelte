<script>
  export let onDragStart = () => {}
</script>

<div class="w-7 h-7 flex justify-center items-center cursor-move" on:mousedown={onDragStart}>
  <div class="relative dots-container">
    <div class="dot dot-1 bg-theme-800 dark:bg-white" />
    <div class="dot dot-2 bg-theme-800 dark:bg-white" />
    <div class="dot dot-3 bg-theme-800 dark:bg-white" />
    <div class="dot dot-4 bg-theme-800 dark:bg-white" />
    <div class="dot dot-5 bg-theme-800 dark:bg-white" />
    <div class="dot dot-6 bg-theme-800 dark:bg-white" />
  </div>
</div>

<style>
  .dots-container {
    width: 8px;
    height: 14px;
  }
  .dot {
    position: absolute;
    margin-left: -1.5px;
    margin-top: -1.5px;
    width: 3px;
    height: 3px;
    border-radius: 2px;
  }

  .dot-1 {
    left: 0;
    top: 0;
  }
  .dot-2 {
    right: 0;
    top: 0;
  }
  .dot-3 {
    left: 0;
    top: 49%;
  }
  .dot-4 {
    right: 0;
    top: 49%;
  }
  .dot-5 {
    left: 0;
    bottom: 0;
  }
  .dot-6 {
    right: 0;
    bottom: 0;
  }
</style>
