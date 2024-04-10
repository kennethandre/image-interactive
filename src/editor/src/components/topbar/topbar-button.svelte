<script>
  import { fade } from 'svelte/transition'
  import { onMount } from 'svelte'
  import Key from 'Editor/components/UI/key'

  export let label = ''
  export let onClick = () => {}
  export let active
  export let primary
  export let danger
  export let disabled
  export let icon
  export let event
  export let tooltip = ''
  export let shortcut = []
  export let fullOpacity = false

  let styleClass = 'btn-transparent'
  let labelClass
  let mouseover = false

  $: {
    styleClass = 'btn-transparent'
    if (active || primary) styleClass = 'btn-primary'
    if (danger) styleClass = 'btn-danger'
    if (disabled) styleClass += ' opacity-50 pointer-events-none'
  }

  $: {
    if (!icon) {
      labelClass = 'text-lg'
    } else {
      labelClass = '2xl:ml-2'
    }
  }

  function _onClick() {
    onClick()
    let e = new Event(event)
    document.dispatchEvent(e)
  }
</script>

<div class="mx-0.5 2xl:mx-1 {!active && !mouseover && !fullOpacity ? 'opacity-50' : ''}">
  <div
    class="
      btn
      relative
      {styleClass}
      cursor-pointer
      active:text-white
      rounded-lg
      text-center
      px-3
      py-1
      flex
      flex-col
      2xl:flex-row
      items-center
      justify-center"
    on:click={_onClick}
    on:keypress={_onClick}
    on:mouseenter={() => {
      mouseover = true
    }}
    on:mouseleave={() => {
      mouseover = false
    }}
  >
    {#if icon}
      <div class="{icon} text-base" />
    {/if}
    {#if label}
      <div class={labelClass}>
        {label}
      </div>
    {/if}
    <slot />

    <!-- Tooltip -->
    {#if mouseover && (tooltip || shortcut.length > 0)}
      <div
        transition:fade={{ duration: 150 }}
        class="
          absolute
          left-auto
          top-full
          whitespace-nowrap
          mt-6
          px-4
          py-2
          pointer-events-none
          bg-black
          bg-opacity-80
          rounded
          text-white
          z-50
          flex items-center"
      >
        {tooltip}

        {#if shortcut.length > 0}
          <div class="{tooltip.length > 0 ? 'ml-2' : ''} flex">
            {#each shortcut as key}
              <Key value={key} />
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>
