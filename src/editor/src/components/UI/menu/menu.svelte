<script>
  import * as utils from 'Editor/scripts/utilities'
  import * as consts from 'Editor/scripts/consts'
  import { onDestroy, onMount } from 'svelte'

  export let name = ''
  export let classes = ''
  export let moveToRoot = false

  let id = utils.uuidv4()
  let root
  let isVisible

  onMount(() => {
    if (moveToRoot) {
      root.remove()
      document.querySelector('#imp-app').appendChild(root)
    }
    createEvents()
  })
  onDestroy(() => {
    hide()
    removeEvents()
  })

  export function show(x, y) {
    root.classList.remove('transition-all')
    root.classList.remove('scale-0')

    requestAnimationFrame(() => {
      if (x && y) {
        root.style.left = x + 'px'
        root.style.top = y + 'px'
      } else {
        let pos = calcPosition()
        root.style.left = pos.x + 'px'
        root.style.top = pos.y + 'px'
      }

      root.classList.add('scale-0')

      requestAnimationFrame(() => {
        root.classList.add('transition-all')
        root.classList.remove('scale-0')
        root.classList.remove('opacity-0')
      })

      isVisible = true
    })
  }
  export function hide() {
    root.classList.add('transition-all')
    root.classList.add('scale-0')
    root.classList.add('opacity-0')
    isVisible = false
  }
  export function toggle(x, y) {
    if (!isVisible) {
      show(x, y)
    } else {
      hide()
    }
  }
  export function recalc() {
    root.style.width = ''
    root.style.height = ''

    setTimeout(() => {
      root.dataset.width = root.getBoundingClientRect().width
      root.dataset.height = root.getBoundingClientRect().height
      root.style.width = root.dataset.width + 'px'
      root.style.height = root.dataset.height + 'px'
    }, 1)
  }
  export function updatePosition() {
    let pos = calcPosition()
    root.style.left = pos.x + 'px'
    root.style.top = pos.y + 'px'
  }

  function calcPosition() {
    let rect = root.getBoundingClientRect()
    let buttonRect = document.querySelector(`[data-open-menu="${name}"]`).getBoundingClientRect()

    root.classList.add('origin-top-left')
    root.classList.remove('origin-bottom-left')

    let y = buttonRect.y + buttonRect.height + 4
    let x = buttonRect.x

    if (x < 0) {
      x = 0
    }
    if (x + rect.width > window.innerWidth) {
      x = window.innerWidth - rect.width
    }

    if (y < 0) {
      y = 0
    }
    if (y + rect.height > window.innerHeight) {
      y = buttonRect.y - 4 - rect.height
      root.classList.remove('origin-top-left')
      root.classList.add('origin-bottom-left')
    }
    if (y + rect.height > window.innerHeight) {
      y = window.innerHeight - rect.height
    }

    return { x, y }
  }

  function createEvents() {
    document.addEventListener('mousedown', handleMousedown)
    document.addEventListener('click', handleClick)
    window.addEventListener('scroll', handleScroll)
  }
  function removeEvents() {
    document.removeEventListener('mousedown', handleMousedown)
    document.removeEventListener('click', handleClick)
    window.removeEventListener('scroll', handleScroll)
  }
  let eventStartedInMenu = false
  function handleMousedown(e) {
    if (e.target.closest(`[data-id="${id}"]`)) {
      eventStartedInMenu = true
    } else {
      eventStartedInMenu = false
    }
  }
  function handleClick(e) {
    if (e.target.dataset.openMenu === name) {
      toggle()
      return
    }

    if (!eventStartedInMenu) {
      hide()
      return
    }

    if (e.target.classList.contains('menu-option') || e.target.closest('.menu-option')) {
      hide()
      return
    }
  }
  function handleScroll() {
    hide()
  }
</script>

<div data-id={id} bind:this={root} class="{classes} ui fixed transition-all origin-top-left opacity-0 scale-0" style="z-index: 99999">
  <slot />
</div>
