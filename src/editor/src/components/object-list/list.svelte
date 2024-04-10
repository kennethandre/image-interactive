<script>
  import { store, setters } from 'Editor/store'
  import { selected } from 'Editor/store/ui'
  import HierarchyManager from 'Editor/scripts/hierarchyManager'
  import Item from 'Editor/components/object-list/item'
  import Placeholder from 'Editor/components/object-list/placeholder.svelte'
  import { afterUpdate, onDestroy, onMount, setContext } from 'svelte'
  import * as consts from 'Editor/scripts/consts'
  import FormControl from 'Editor/components/UI/form-controls/form-control'

  let subscribers = []
  let root
  let hierarchyManager = new HierarchyManager(store.getState().map.present.artboards)
  let itemHeight = 40
  let childHorizontalOffset = 20
  let childComponents = {}
  let placeholder
  let list

  onMount(() => {
    root.style.width = parseInt(getComputedStyle(root).width) + 'px'
    render()
    requestAnimationFrame(() => {
      addTransitions()
    })
    createEvents()
  })
  onDestroy(() => {
    subscribers.forEach((unsub) => unsub())
    subscribers = []
    removeEvents()
  })
  setContext('object-list', {
    toggle: (id) => {
      hierarchyManager.toggle(id)
      hierarchyManager.items = hierarchyManager.items
    },
    mouseDown: (id) => {
      handleListMouseDown(id)
    },
    select: (id) => {
      selectItem(id)
    },
  })
  afterUpdate(() => {
    // Clean up child components
    for (let index in childComponents) {
      if (childComponents[index] === null) {
        delete childComponents[index]
      }
    }

    render()
  })
  subscribers.push(
    store.subscribe(() => {
      hierarchyManager.init(store.getState().map.present.artboards)
      hierarchyManager.items = hierarchyManager.items

      // When the store updates, it's possible that new items were created
      // Because all created components start with no transitions, we add them manually
      // after the above code triggers afterUpdate() and the new components have been created
      requestAnimationFrame(() => {
        addTransitions()
      })
    })
  )
  subscribers.push(
    selected.subscribe(() => {
      scrollListOnSelect()
    })
  )

  function createEvents() {
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)
    window.addEventListener('focus', handleFocus)
    window.addEventListener('resize', handleResize)
    document.addEventListener(consts.EVENT_GROUP_ITEMS, handleGroupItems)
    document.addEventListener(consts.EVENT_DELETE_ITEMS, handleDeleteItems)
    document.addEventListener(consts.SHORTCUT_DELETE, handleDeleteItems)
  }
  function removeEvents() {
    document.removeEventListener('mousedown', handleMouseDown)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    document.removeEventListener('keydown', handleKeyDown)
    document.removeEventListener('keyup', handleKeyUp)
    window.removeEventListener('focus', handleFocus)
    window.removeEventListener('resize', handleResize)
    document.removeEventListener(consts.EVENT_GROUP_ITEMS, handleGroupItems)
    document.removeEventListener(consts.EVENT_DELETE_ITEMS, handleDeleteItems)
    document.removeEventListener(consts.SHORTCUT_DELETE, handleDeleteItems)
  }

  function render() {
    let top = 0
    let rootWidth = root.getBoundingClientRect().width

    hierarchyManager.traverse((item, visible) => {
      let offsetTop = top
      let pathDepth = item.path.split('.').length - 2
      if (pathDepth < 0) pathDepth = 0
      let offsetLeft = pathDepth * childHorizontalOffset
      let width = rootWidth - offsetLeft

      if (!dragging || (dragging && !draggedItemsFullTreeIds.includes(item.id))) {
        childComponents[item.id].setOffsetTop(offsetTop)
        childComponents[item.id].setOffsetLeft(offsetLeft)
        childComponents[item.id].setWidth(width)

        if (visible) {
          childComponents[item.id].show()
        } else {
          childComponents[item.id].hide()
        }
      }

      if (dragging && item.id === draggedItemsFullTreeIds[0]) {
        placeholder.setOffsetTop(offsetTop)
        placeholder.setOffsetLeft(offsetLeft)
        placeholder.setHeight(getHeightOfItems(draggedItemsFullTree))
        placeholder.setWidth(width)
        placeholder.show()
      }

      if (visible) top += itemHeight
    })

    if (!dragging) {
      placeholder.hide()
    }
  }
  function addTransitions() {
    hierarchyManager.traverse((item) => {
      childComponents[item.id].addTransitions()
    })
  }
  function removeTransitions() {
    // deprecated
    hierarchyManager.traverse((item) => {
      childComponents[item.id].removeTransitions()
    })
  }

  // Select functionality
  function selectItem(id) {
    if (ctrlDown) {
      // If there is only one item selected and it's an artboard, clear selection
      if ($selected.length === 1 && hierarchyManager.getItem($selected[0]).type === 'artboard') {
        setters.setSelection([])
      }

      // If the target item is an artboard, clear selection
      if (hierarchyManager.getItem(id).type === 'artboard') {
        setters.setSelection([])
      }

      if (!$selected.includes(id)) {
        setters.setSelection([...$selected, id])
      } else {
        setters.setSelection($selected.filter((item) => item !== id))
      }
    } else if (shiftDown) {
      let firstSelectedId = $selected[0]
      let lastSelectedId = $selected[$selected.length - 1]
      let sorted = hierarchyManager.sort([firstSelectedId, lastSelectedId, id])
      let newSelectionStartId = sorted[0]
      let newSelectionEndId = sorted[sorted.length - 1]
      let newSelection = hierarchyManager.getRange(newSelectionStartId, newSelectionEndId)
      setters.setSelection(newSelection)
    } else {
      setters.setSelection([id])
    }
  }

  // Group functionality
  function groupSelectedItems() {
    let selectedItems = $selected

    if (selectedItems.length === 0) return
    if (hierarchyManager.getItem(selectedItems[0]).type === 'artboard') return

    setters.groupItems({ ids: hierarchyManager.sort(hierarchyManager.shakeTree(selectedItems)) })
  }

  // Delete functionality
  function deleteSelectedItems() {
    if ($selected.length === 0) return
    let selectedItems = $selected
    setters.setSelection([])
    setters.deleteObjects({ ids: selectedItems })
  }

  // Search functionality
  function updateSearch() {
    if (searchString.length > 2) {
      hierarchyManager.expandAll()
    }

    hierarchyManager.traverse((item, visible) => {
      if (item.type !== consts.OBJECT_ARTBOARD && item.title.toLowerCase().indexOf(searchString.toLowerCase()) == -1 && searchString.length > 2) {
        hierarchyManager.setVisible({ id: item.id, visible: false })
      } else {
        hierarchyManager.setVisible({ id: item.id, visible: true })
      }
    })
    render()
  }

  // Scroll list on select
  function scrollListOnSelect() {
    if ($selected.length === 0) return

    // Calc the boundaries of the first and last selected item
    let indicesOfSelectedItems = []
    let i = 0
    hierarchyManager.traverse((item, visible) => {
      if (!visible) return
      if ($selected.includes(item.id)) indicesOfSelectedItems.push(i)
      i++
    })

    if (indicesOfSelectedItems.length === 0) return

    let boundaryTop = indicesOfSelectedItems[0] * 40
    let boundaryBottom = indicesOfSelectedItems[indicesOfSelectedItems.length - 1] * 40 + 40

    // Determine how much to scroll the list
    let listRect = list.getBoundingClientRect()

    let minScroll = boundaryBottom - listRect.height
    let maxScroll = boundaryTop

    if (list.scrollTop < minScroll) list.scrollTop = minScroll
    if (list.scrollTop > maxScroll) list.scrollTop = maxScroll
  }

  // Drag functionality
  let dragging = false
  let canStartDragging = false
  let dragStartingItemId
  let draggedItemsIds = []
  let draggedItemsFullTree = []
  let draggedItemsFullTreeIds = []
  let cache = {}
  let currentEventCoordinates = { x: 0, y: 0 }
  let startEventCoordinates = { x: 0, y: 0 }
  let dx = 0
  let dy = 0
  let thresholdToStartDragging = 5
  let moveUpDownThresholds
  let insertIntoItemWithId
  let dragDirection = undefined // up / down
  let prevDragTargetRectTop
  let listScrollInitial = 0

  // Keys down
  let shiftDown = false
  let ctrlDown = false

  // Search
  let searchString

  // -- Event handlers
  function handleListMouseDown(id) {
    canStartDragging = true
    dragStartingItemId = id
  }
  function handleMouseDown(e) {
    startEventCoordinates = { x: e.pageX, y: e.pageY }
    dx = 0
    dy = 0
  }
  function handleMouseMove(e) {
    currentEventCoordinates = { x: e.pageX, y: e.pageY }
    dx = currentEventCoordinates.x - startEventCoordinates.x
    dy = currentEventCoordinates.y - startEventCoordinates.y

    if (canStartDragging && (Math.abs(dx) > thresholdToStartDragging || Math.abs(dy) > thresholdToStartDragging)) {
      startEventCoordinates = { x: e.pageX, y: e.pageY }
      dx = currentEventCoordinates.x - startEventCoordinates.x
      dy = currentEventCoordinates.y - startEventCoordinates.y
      canStartDragging = false
      dragging = true
      startDrag()
    }

    if (dragging) {
      drag()
    }
  }
  function handleMouseUp(e) {
    endDrag()
    dragging = false
    canStartDragging = false
  }
  function handleKeyDown(e) {
    shiftDown = e.shiftKey
    ctrlDown = e.ctrlKey || e.metaKey
  }
  function handleKeyUp(e) {
    shiftDown = false
    ctrlDown = false
  }
  function handleFocus(e) {
    shiftDown = false
    ctrlDown = false
  }
  function handleResize() {
    render()
  }
  function handleGroupItems() {
    groupSelectedItems()
  }
  function handleDeleteItems() {
    deleteSelectedItems()
  }

  // -- Level 2
  function startDrag() {
    moveUpDownThresholds = undefined
    listScrollInitial = list.scrollTop
    clearCache()
    gatherSelectedItems()
    buildCache()
    removeDraggedItemTransitions()
    render()
  }
  function drag() {
    // update position
    updateDraggedItemPosition()

    // update drag rect
    updateDraggedItemRectCache()

    // update drag direction
    updateDragDirection()

    // calculate thresholds
    if (!moveUpDownThresholds) {
      calcMoveUpDownThresholds()
    }

    // check "move up/down" thresholds, transform, clear thresholds
    if (moveUpDownThresholds !== undefined && cache['dragTargetRect'].top < moveUpDownThresholds.top) {
      hierarchyManager.moveItemsUp(draggedItemsIds)
      hierarchyManager.items = hierarchyManager.items
      moveUpDownThresholds = undefined
    }
    if (moveUpDownThresholds !== undefined && cache['dragTargetRect'].top + cache['dragTargetRect'].height > moveUpDownThresholds.bottom) {
      hierarchyManager.moveItemsDown(draggedItemsIds)
      hierarchyManager.items = hierarchyManager.items
      moveUpDownThresholds = undefined
    }
    if (moveUpDownThresholds !== undefined && cache['dragTargetRect'].left < moveUpDownThresholds.left) {
      hierarchyManager.moveItemsLeft(draggedItemsIds)
      hierarchyManager.items = hierarchyManager.items
      moveUpDownThresholds = undefined
    }
    if (moveUpDownThresholds !== undefined && cache['dragTargetRect'].left > moveUpDownThresholds.right) {
      hierarchyManager.moveItemsRight(draggedItemsIds)
      hierarchyManager.items = hierarchyManager.items
      moveUpDownThresholds = undefined
    }

    // check if the dragged item can be inserted into the item currently under the mouse
    insertIntoItemWithId = calcInsertIntoItem()

    // update highlighted items
    updateHighlightedItems()
  }
  function endDrag() {
    if (dragging) {
      if (insertIntoItemWithId) {
        hierarchyManager.moveInto({ itemIds: draggedItemsIds, parentId: insertIntoItemWithId })
      }

      addDraggedItemTransitions()
      clearHighlightedItems()

      let item = hierarchyManager.getItem(draggedItemsIds[0])
      let parent = hierarchyManager.getParent(item.id)

      setters.moveItems({ ids: draggedItemsIds, parentId: parent.id, index: item.index })

      // If the original dragged item is not selected, then select it
      if (!$selected.includes(dragStartingItemId)) {
        setters.setSelection([dragStartingItemId])
      }
    }
  }

  // -- Level 1
  function gatherSelectedItems() {
    if ($selected.includes(dragStartingItemId)) {
      draggedItemsIds = $selected
      draggedItemsIds = hierarchyManager.shakeTree(draggedItemsIds)
      hierarchyManager.gather({ mainItemId: dragStartingItemId, itemIds: draggedItemsIds })
      draggedItemsIds = hierarchyManager.sort(draggedItemsIds)
      hierarchyManager.items = hierarchyManager.items
      render()
    } else {
      draggedItemsIds = [dragStartingItemId]
    }
  }
  function getTreeHeight(id) {
    let tree = hierarchyManager.getVisibleTreeOfItems([id])
    return childComponents[tree[tree.length - 1].id].getOffsetTop() + childComponents[tree[tree.length - 1].id].getHeight() - childComponents[tree[0].id].getOffsetTop()
  }
  function getHeightOfItems(items) {
    let height = 0
    for (let item of items) {
      height += childComponents[item.id].getHeight()
    }
    return height
  }
  function clearCache() {
    draggedItemsIds = []
    draggedItemsFullTree = []
    draggedItemsFullTreeIds = []
    cache = {}
  }
  function buildCache() {
    draggedItemsFullTree = hierarchyManager.getVisibleTreeOfItems(draggedItemsIds)
    draggedItemsFullTreeIds = []

    for (let item of draggedItemsFullTree) {
      draggedItemsFullTreeIds.push(item.id)
      cache[item.id] = {
        offsetTop: childComponents[item.id].getOffsetTop(),
        offsetLeft: childComponents[item.id].getOffsetLeft(),
        width: childComponents[item.id].getWidth(),
        height: childComponents[item.id].getHeight(),
      }
    }

    cache['dragTargetRect'] = {
      left: childComponents[draggedItemsFullTree[0].id].getOffsetLeft(),
      top: childComponents[draggedItemsFullTree[0].id].getOffsetTop(),
      width: childComponents[draggedItemsFullTree[0].id].getWidth(),
      height: getHeightOfItems(draggedItemsFullTree),
    }
  }
  function updateDraggedItemPosition() {
    for (let item of draggedItemsFullTree) {
      childComponents[item.id].setOffsetLeft(cache[item.id].offsetLeft + dx)
      childComponents[item.id].setOffsetTop(cache[item.id].offsetTop + dy + (list.scrollTop - listScrollInitial))
    }
  }
  function updateDraggedItemRectCache() {
    cache['dragTargetRect'].left = childComponents[draggedItemsFullTree[0].id].getOffsetLeft()
    cache['dragTargetRect'].top = childComponents[draggedItemsFullTree[0].id].getOffsetTop()
  }
  function updateDragDirection() {
    if (!prevDragTargetRectTop) {
      prevDragTargetRectTop = cache['dragTargetRect'].top
    }

    if (cache['dragTargetRect'].top > placeholder.getOffsetTop()) {
      dragDirection = 'down'
    } else if (cache['dragTargetRect'].top < placeholder.getOffsetTop()) {
      dragDirection = 'up'
    } else {
      dragDirection = dragDirection
    }

    prevDragTargetRectTop = cache['dragTargetRect'].top
  }
  function calcMoveUpDownThresholds() {
    let prevItem = hierarchyManager.getPrev(draggedItemsFullTreeIds[0])
    let nextItem = hierarchyManager.getNext(draggedItemsFullTreeIds[draggedItemsFullTreeIds.length - 1])
    let draggedItem = hierarchyManager.getItem(dragStartingItemId)

    if (draggedItem.type === 'artboard') {
      // Exception:
      // If the dragged item is an artboard, get its next item,
      // instead of the next item of its last child
      nextItem = hierarchyManager.getNext(dragStartingItemId)

      if (prevItem) {
        moveUpDownThresholds = moveUpDownThresholds || {}
        moveUpDownThresholds['top'] = childComponents[prevItem.id].getOffsetTop() + getTreeHeight(prevItem.id) / 2
      }
      if (nextItem) {
        moveUpDownThresholds = moveUpDownThresholds || {}
        moveUpDownThresholds['bottom'] = childComponents[nextItem.id].getOffsetTop() + getTreeHeight(nextItem.id) / 2
      }
    } else {
      if (prevItem) {
        moveUpDownThresholds = moveUpDownThresholds || {}
        if (prevItem.type === 'artboard' || prevItem.type === 'group') {
          moveUpDownThresholds['top'] = childComponents[prevItem.id].getOffsetTop()
        } else {
          moveUpDownThresholds['top'] = childComponents[prevItem.id].getOffsetTop() + childComponents[prevItem.id].getHeight() / 2
        }

        moveUpDownThresholds['left'] = childComponents[dragStartingItemId].getOffsetLeft() - 20
        moveUpDownThresholds['right'] = childComponents[dragStartingItemId].getOffsetLeft() + 20
      }
      if (nextItem) {
        moveUpDownThresholds = moveUpDownThresholds || {}
        if (nextItem.type === 'artboard' || nextItem.type === 'group') {
          moveUpDownThresholds['bottom'] = childComponents[nextItem.id].getOffsetTop() + childComponents[nextItem.id].getHeight()
        } else {
          moveUpDownThresholds['bottom'] = childComponents[nextItem.id].getOffsetTop() + childComponents[nextItem.id].getHeight() / 2
        }
      }
    }
  }
  function calcInsertIntoItem() {
    // If the dragged item is an artboard, return
    if (hierarchyManager.getItem(draggedItemsIds[0]).type === 'artboard') return

    // Calculate the Y coord of the item that we are going to test
    // if it can become a child
    let yCoord
    if (dragDirection === 'up') {
      yCoord = cache['dragTargetRect'].top + 10
    } else {
      yCoord = cache['dragTargetRect'].top + cache['dragTargetRect'].height - 10
    }

    // Calculate the index of the item under the Y coord
    let itemUnderYCoordIndex
    itemUnderYCoordIndex = Math.floor(yCoord / itemHeight)

    // Get the item with that index
    // count only VISIBLE items!
    let itemUnderYCoordId
    let count = 0
    hierarchyManager.traverse((traversedItem, visible) => {
      if (!visible) return
      if (count === itemUnderYCoordIndex) {
        itemUnderYCoordId = traversedItem.id
      }
      count++
    })

    // Check if the item under the Y coord can become a parent
    // of the item being tested
    if (draggedItemsFullTreeIds.includes(itemUnderYCoordId)) return
    if (!hierarchyManager.getItem(itemUnderYCoordId).collapsed) return
    if ((hierarchyManager.getItem(itemUnderYCoordId).type === 'artboard' || hierarchyManager.getItem(itemUnderYCoordId).type === 'group') && !hierarchyManager._isGrandchild(itemUnderYCoordId, draggedItemsIds) && itemUnderYCoordId !== undefined) {
      return itemUnderYCoordId
    }

    // If not, return nothing
    return undefined
  }
  function updateHighlightedItems() {
    for (let childId in childComponents) {
      if (childId === insertIntoItemWithId) {
        childComponents[insertIntoItemWithId].highlight()
      } else {
        childComponents[childId].unhighlight()
      }
    }

    if (insertIntoItemWithId) {
      placeholder.hide()
    } else {
      placeholder.show()
    }
  }
  function clearHighlightedItems() {
    for (let childId in childComponents) {
      childComponents[childId].unhighlight()
    }
  }
  function addDraggedItemTransitions() {
    for (let item of draggedItemsFullTree) {
      childComponents[item.id].addTransitions()
      childComponents[item.id].removeDragStyle()
    }
  }
  function removeDraggedItemTransitions() {
    for (let item of draggedItemsFullTree) {
      childComponents[item.id].removeTransitions()
      childComponents[item.id].setDragStyle()
    }
  }
</script>

<div bind:this={root} class="flex flex-col h-full transition-all border-r border-theme-200 bg-theme-100 dark:border-theme-700 dark:bg-theme-800">
  <div class="p-2">
    <FormControl type="search" placeholder="Search Object" onUpdate={updateSearch} bind:value={searchString} />
    <div class="flex">
      <FormControl type="button" icon="fa-solid fa-plus" name="New Artboard" action={setters.createArtboard} />
      <FormControl type="button" icon="fa-regular fa-object-group" name="Group" action={groupSelectedItems} />
      <FormControl type="button" icon="fa-solid fa-trash" action={deleteSelectedItems} />
    </div>
  </div>
  <div data-ui-object-type={consts.UI_OBJECT_LIST} bind:this={list} class="pretty-scroll flex-1 relative overflow-y-auto overflow-x-hidden">
    <Placeholder bind:this={placeholder} />
    {#each hierarchyManager.items as item (item.id)}
      <Item bind:this={childComponents[item.id]} {...item} selected={$selected.includes(item.id)} childrenCount={hierarchyManager.getVisibleTreeOfItems([item.id]).length - 1} />
    {/each}
  </div>
</div>
