import * as consts from 'Editor/scripts/consts'

let ctrlDown = false
let altDown = false
let shiftDown = false

let canZoom = true
let zoomTimeout

function isWindows() {
  return navigator.platform.indexOf('Win') > -1
}

document.addEventListener('keydown', (e) => {
  if (document.activeElement.getAttribute('contenteditable') === 'true') return

  if (e.code === 'Enter' && !ctrlDown && !altDown && !shiftDown) {
    document.activeElement.blur()
    document.dispatchEvent(new Event(consts.SHORTCUT_ENTER))
    e.preventDefault()
  }
  if (e.code === 'Escape' && !ctrlDown && !altDown && !shiftDown) {
    document.activeElement.blur()
    document.dispatchEvent(new Event(consts.SHORTCUT_ESC))
    e.preventDefault()
  }

  if (['input', 'textarea'].includes(document.activeElement.tagName.toLowerCase())) return

  if (e.key === 'Control' || (!isWindows() && e.key === 'Meta')) ctrlDown = true
  if (e.key === 'Alt') altDown = true
  if (e.key === 'Shift') shiftDown = true

  if (e.code === 'KeyV' && !ctrlDown && !altDown && !shiftDown) {
    document.dispatchEvent(new Event(consts.SHORTCUT_SELECT))
    e.preventDefault()
  }
  if (e.code === 'KeyS' && !ctrlDown && !altDown && !shiftDown) {
    document.dispatchEvent(new Event(consts.SHORTCUT_SPOT))
    e.preventDefault()
  }
  if (e.code === 'KeyR' && !ctrlDown && !altDown && !shiftDown) {
    document.dispatchEvent(new Event(consts.SHORTCUT_RECT))
    e.preventDefault()
  }
  if (e.code === 'KeyE' && !ctrlDown && !altDown && !shiftDown) {
    document.dispatchEvent(new Event(consts.SHORTCUT_OVAL))
    e.preventDefault()
  }
  if (e.code === 'KeyP' && !ctrlDown && !altDown && !shiftDown) {
    document.dispatchEvent(new Event(consts.SHORTCUT_POLY))
    e.preventDefault()
  }
  if (e.code === 'KeyT' && !ctrlDown && !altDown && !shiftDown) {
    document.dispatchEvent(new Event(consts.SHORTCUT_TEXT))
    e.preventDefault()
  }

  if (e.code === 'Space' && !ctrlDown && !altDown && !shiftDown) {
    document.dispatchEvent(new Event(consts.SHORTCUT_PAN_START))
    e.preventDefault()
  }
  if (e.code === 'Equal' && ctrlDown && !altDown && !shiftDown) {
    document.dispatchEvent(new Event(consts.SHORTCUT_ZOOM_IN))
    e.preventDefault()
  }
  if (e.code === 'Minus' && ctrlDown && !altDown && !shiftDown) {
    document.dispatchEvent(new Event(consts.SHORTCUT_ZOOM_OUT))
    e.preventDefault()
  }
  if (e.code === 'Digit0' && ctrlDown && !altDown && !shiftDown) {
    document.dispatchEvent(new Event(consts.SHORTCUT_ZOOM_RESET))
    e.preventDefault()
  }

  if (e.code === 'Digit1' && ctrlDown && altDown && !shiftDown) {
    document.dispatchEvent(new Event(consts.SHORTCUT_HIDE_OBJECT_LIST))
    e.preventDefault()
  }
  if (e.code === 'Digit2' && ctrlDown && altDown && !shiftDown) {
    document.dispatchEvent(new Event(consts.SHORTCUT_HIDE_OBJECT_SETTINGS))
    e.preventDefault()
  }

  if (e.code === 'KeyZ' && ctrlDown && !altDown && !shiftDown) {
    document.dispatchEvent(new Event(consts.EVENT_UNDO))
    e.preventDefault()
  }
  if (e.code === 'KeyY' && ctrlDown && !altDown && !shiftDown) {
    document.dispatchEvent(new Event(consts.EVENT_REDO))
    e.preventDefault()
  }
  if (e.code === 'KeyZ' && ctrlDown && !altDown && shiftDown) {
    document.dispatchEvent(new Event(consts.EVENT_REDO))
    e.preventDefault()
  }
  if (e.code === 'KeyP' && ctrlDown && !altDown && !shiftDown) {
    document.dispatchEvent(new Event(consts.SHORTCUT_PREVIEW))
    e.preventDefault()
  }
  if (e.code === 'Delete' && !ctrlDown && !altDown && !shiftDown) {
    document.dispatchEvent(new Event(consts.SHORTCUT_DELETE))
    e.preventDefault()
  }
  if (e.code === 'KeyE' && ctrlDown && !altDown && !shiftDown) {
    document.dispatchEvent(new Event(consts.EVENT_EXECUTE_ACTION_MODAL))
    e.preventDefault()
  }
})

document.addEventListener('keyup', (e) => {
  if (['input', 'textarea'].includes(document.activeElement.tagName.toLowerCase())) return

  if (e.key === 'Control' || (!isWindows() && e.key === 'Meta')) ctrlDown = false
  if (e.key === 'Alt') altDown = false
  if (e.key === 'Shift') shiftDown = false

  if (e.code === 'Space' && !ctrlDown && !altDown && !shiftDown) {
    document.dispatchEvent(new Event(consts.SHORTCUT_PAN_END))
    e.preventDefault()
  }
})

window.addEventListener('focus', () => {
  ctrlDown = false
  altDown = false
  shiftDown = false
})

document.addEventListener('wheel', (e) => {
  if (canZoom && e.deltaY < 0 && ctrlDown && !altDown && !shiftDown) {
    canZoom = false
    document.dispatchEvent(new Event(consts.SHORTCUT_WHEEL_ZOOM_IN))
    clearTimeout(zoomTimeout)
    zoomTimeout = setTimeout(() => {
      canZoom = true
    }, 150)
  }
  if (canZoom && e.deltaY > 0 && ctrlDown && !altDown && !shiftDown) {
    canZoom = false
    document.dispatchEvent(new Event(consts.SHORTCUT_WHEEL_ZOOM_OUT))
    clearTimeout(zoomTimeout)
    zoomTimeout = setTimeout(() => {
      canZoom = true
    }, 150)
  }
})