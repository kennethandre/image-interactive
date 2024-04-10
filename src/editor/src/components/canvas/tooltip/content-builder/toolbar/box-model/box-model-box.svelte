<script>
  export let title
  export let bg
</script>

<div class="relative flex w-full h-full" style="background: {bg}">
  <div class="absolute left-0 top-0 p-1">{title}</div>
  <!-- PADDING: Left -->
  <div class="flex justify-center items-center p-1" style="min-width: 30px;">
    <slot name="left" />
  </div>
  <div class="flex-1 flex flex-col">
    <!-- PADDING: Top -->
    <div class="flex justify-center p-1" style="min-height: 30px;">
      <slot name="top" />
    </div>
    <div class="border border-black flex-1 flex items-center justify-center" style="background: #82B7C3">
      <!-- WIDTH / HEIGHT -->
      <slot name="center" />
    </div>
    <!-- PADDING: Bottom -->
    <div class="flex justify-center p-1" style="min-height: 30px;">
      <slot name="bottom" />
    </div>
  </div>
  <!-- PADDING: Right -->
  <div class="flex justify-center items-center p-1" style="min-width: 30px;">
    <slot name="right" />
  </div>
</div>
