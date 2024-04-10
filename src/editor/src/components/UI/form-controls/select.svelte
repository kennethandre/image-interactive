<script>
  export let value
  export let onChange = () => {}
  export let options
</script>

<div class="flex flex-col items-center">
  <div class="relative w-full">
    <select
      type="text"
      bind:value
      on:change={onChange}
      style="height: 24px; appearance: none;"
      class="
      flex-1
      w-full
      pl-1.5
      pr-4
      rounded
      outline-none
      form-control-ring
      form-control-bg
      transition-all duration-200"
    >
      {#each options as option (option.value)}
        <option value={option.value}>{option.name}</option>
      {/each}
    </select>
    <div class="absolute right-0 top-0 pointer-events-none fa-solid fa-angle-down w-4 h-full flex justify-center items-center" />
  </div>
</div>
