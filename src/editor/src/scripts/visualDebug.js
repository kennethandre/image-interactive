let context = undefined
let canvas = undefined

export function clear() {
  if (!context) init()

  context.clearRect(0, 0, canvas.width, canvas.height)
}

export function drawPoint({ x, y, color }) {
  if (!context) init()

  context.fillStyle = color || getRandomColor()
  context.fillRect(x - 5, y - 5, 10, 10)
}
export function drawRect({ x, y, width, height, color }) {
  if (!context) init()

  context.fillStyle = color || getRandomColor()
  context.fillRect(x, y, width || canvas.width, height)
}

export function drawGuideHorizontal({ y, color }) {
  if (!context) init()

  context.strokeStyle = color || getRandomColor()
  context.beginPath()
  context.moveTo(0, y)
  context.lineTo(canvas.width, y)
  context.stroke()
}
export function drawGuideVertical({ x, color }) {
  if (!context) init()

  context.strokeStyle = color || getRandomColor()
  context.beginPath()
  context.moveTo(x, 0)
  context.lineTo(x, canvas.height)
  context.stroke()
}

export function highlightElement({ selector, color }) {
  let element = document.querySelector(selector)
  if (!element) return

  drawRect({
    x: element.getBoundingClientRect().x,
    y: element.getBoundingClientRect().y + window.scrollY,
    width: element.getBoundingClientRect().width,
    height: element.getBoundingClientRect().height,
    color: color
  })
}

function init() {
  if (!canvas) {
    canvas = document.createElement('canvas')
    canvas.setAttribute('id', 'visual-debug-canvas')
    canvas.style.position = 'absolute'
    canvas.style.left = 0
    canvas.style.top = 0
    canvas.style.zIndex = 99999999
    canvas.setAttribute('width', document.documentElement.offsetWidth)
    canvas.setAttribute('height', document.documentElement.offsetHeight)
    canvas.style.pointerEvents = 'none'
    document.body.appendChild(canvas)
    context = canvas.getContext('2d')
  }
}

function getRandomColor() {
  return `rgba(${255 * Math.random()}, ${255 * Math.random()}, ${255 * Math.random()}, 0.25)`
}