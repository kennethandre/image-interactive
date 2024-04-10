<script>
  import { onDestroy } from 'svelte'
  import { store } from 'Editor/store'
  import Menu from 'Editor/components/UI/menu/menu'
  import TooltipSettings from 'Editor/components/canvas/tooltip/tooltip-settings'

  let subscribers = []
  let menu

  onDestroy(() => {
    subscribers.forEach((unsub) => unsub())
    subscribers = []
  })

  subscribers.push(
    store.subscribe(() => {
      setTimeout(() => {
        if (menu) menu.updatePosition()
      }, 50)
    })
  )
</script>

<div class="ui absolute -right-7 top-0">
  <div data-open-menu="tooltip-menu" class="btn btn-transparent w-6 h-6 fa-solid fa-cog text-xs flex items-center justify-center rounded-sm" />
  <Menu name="tooltip-menu" classes="p-3" bind:this={menu} moveToRoot>
    <div class="w-[250px]">
      <TooltipSettings />
    </div>
  </Menu>
</div>
