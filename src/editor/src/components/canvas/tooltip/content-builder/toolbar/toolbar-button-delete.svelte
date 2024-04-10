<script>
  import { onMount } from 'svelte'
  export let onClick = () => {}

  let trash
  let confirm
  let check
  let times

  onMount(() => {
    confirm.classList.add('hidden')
    check.classList.add('hidden')
    times.classList.add('hidden')
  })

  function showStepOne() {
    trash.classList.remove('hidden')
    confirm.classList.add('hidden')
    check.classList.add('hidden')
    times.classList.add('hidden')
  }
  function showStepTwo() {
    trash.classList.add('hidden')
    confirm.classList.remove('hidden')
    check.classList.remove('hidden')
    times.classList.remove('hidden')
  }
</script>

<div class="flex justify-center items-center select-none">
  <div bind:this={trash} on:click={showStepTwo} on:keypress={showStepTwo} class="flex justify-center items-center fa-solid fa-trash w-7 h-7 cursor-pointer btn btn-transparent rounded" />
  <div bind:this={confirm} class="flex justify-center items-center px-2 h-7 dark:text-white">Delete?</div>
  <div bind:this={check} on:click={onClick} on:keypress={onClick} class="flex justify-center items-center fa-solid fa-check w-7 h-7 cursor-pointer rounded btn btn-danger" />
  <div bind:this={times} on:click={showStepOne} on:keypress={showStepOne} class="flex justify-center items-center fa-solid fa-times ml-1 w-7 h-7 cursor-pointer rounded btn" />
</div>
