import * as consts from 'Editor/scripts/consts'

export let uuidv4 = function () {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
  )
}

export let deepExtend = function (out) {
  out = out || {}

  for (let i = 1; i < arguments.length; i++) {
    let obj = arguments[i]

    if (!obj) continue

    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          if (obj[key] instanceof Array) out[key] = obj[key].slice(0)
          else out[key] = deepExtend(out[key], obj[key])
        } else out[key] = obj[key]
      }
    }
  }

  return out
}

export let hexToRgb = function (hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 }
}

export let hexToHSL = function (H) {
  // Convert hex to RGB first
  let r = 0,
    g = 0,
    b = 0
  if (H.length == 4) {
    r = '0x' + H[1] + H[1]
    g = '0x' + H[2] + H[2]
    b = '0x' + H[3] + H[3]
  } else if (H.length == 7) {
    r = '0x' + H[1] + H[2]
    g = '0x' + H[3] + H[4]
    b = '0x' + H[5] + H[6]
  }
  // Then to HSL
  r /= 255
  g /= 255
  b /= 255
  let cmin = Math.min(r, g, b),
    cmax = Math.max(r, g, b),
    delta = cmax - cmin,
    h = 0,
    s = 0,
    l = 0

  if (delta == 0) h = 0
  else if (cmax == r) h = ((g - b) / delta) % 6
  else if (cmax == g) h = (b - r) / delta + 2
  else h = (r - g) / delta + 4

  h = Math.round(h * 60)

  if (h < 0) h += 360

  l = (cmax + cmin) / 2
  s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1))
  s = +(s * 100).toFixed(1)
  l = +(l * 100).toFixed(1)

  // return "hsl(" + h + "," + s + "%," + l + "%)";
  return { h, s, l }
}

export let compress = function (obj, defaults) {
  let objCopy = deepExtend({}, obj)
  let defaultsCopy = deepExtend({}, defaults)

  var objSubtracted = subtract(objCopy, defaultsCopy)
  var objCleaned = clean(objSubtracted)

  return objCleaned
}

export let ready = function (fn) {
  if (document.readyState != 'loading') {
    fn()
  } else {
    document.addEventListener('DOMContentLoaded', fn)
  }
}

export let getElementRect = function (element) {
  if (Object.prototype.toString.call(element) == '[object String]') {
    element = document.querySelector(element)
  }

  if (!element) {
    // console.log('Element not found!')
    return
  }

  return {
    // jquery width(), height()
    width: parseFloat(getComputedStyle(element, null).width.replace('px', '')),
    height: parseFloat(getComputedStyle(element, null).height.replace('px', '')),

    // jquery outerWidth(), outerHeight()
    // outer width, no margin
    offsetWidth: parseFloat(element.offsetWidth),
    offsetHeight: parseFloat(element.offsetHeight),

    // relative to viewport
    // jquery offset()
    offset: {
      left: element.getBoundingClientRect().left + window.scrollX,
      top: element.getBoundingClientRect().top + window.scrollY,
    },

    // relative to parent
    // jquery position()
    position: {
      left: parseFloat(element.offsetLeft),
      top: parseFloat(element.offsetTop),
    },
  }
}

export let htmlToElement = function (html) {
  var template = document.createElement('template')
  html = html.trim()
  template.innerHTML = html
  return template.content.firstChild
}

export let wrap = function (el, wrapper) {
  el.parentNode.insertBefore(wrapper, el)
  wrapper.appendChild(el)
}

export let getEventCoordinates = function (e) {
  let x, y

  if (e.type === 'touchstart' || e.type === 'touchmove' || e.type === 'touchend' || e.type === 'touchcancel') {
    let touch = e.touches[0] || e.changedTouches[0] || e.touches[0]
    x = touch.pageX
    y = touch.pageY
  } else if (
    e.type === 'mousedown' ||
    e.type === 'mouseup' ||
    e.type === 'mousemove' ||
    e.type === 'mouseover' ||
    e.type === 'mouseout' ||
    e.type === 'mouseenter' ||
    e.type === 'mouseleave' ||
    e.type === 'wheel'
  ) {
    x = e.pageX
    y = e.pageY
  }

  return { x: x, y: y }
}

export let subtract = function (a, b) {
  var r = {}

  // For each property of 'b'
  // if it's different than the corresponding property of 'a'
  // place it in 'r'
  for (var key in b) {
    if (Object.prototype.toString.call(b[key]) === '[object Array]') {
      r[key] = a[key].slice()
    } else if (typeof b[key] == 'object') {
      if (!a[key]) a[key] = {}
      r[key] = subtract(a[key], b[key])
    } else {
      if (b[key] != a[key]) {
        r[key] = a[key]
      }
    }
  }

  return r
}

export let clean = function (a) {
  var r = undefined

  // Check if 'a' is an object or array
  if (Object.prototype.toString.call(a) === '[object Array]') {
    if (a.length == 0) {
      r = undefined
    } else {
      r = a.slice()
    }
  }
  if (typeof a == 'object') {
    // If 'a' is an object, check if it's empty and set to undefined if true
    if (isEmpty(a)) {
      r = undefined
    } else {
      // If 'a' is NOT empty, iterate over each of its properties
      // and recursively clean
      for (var key in a) {
        var cleaned = clean(a[key])

        if (cleaned !== undefined) {
          if (r === undefined) r = {}

          r[key] = cleaned
        }
      }
    }
  } else {
    r = a
  }

  return r
}

export let isNumber = function (n) {
  return !isNaN(parseFloat(n)) && !isNaN(n - 0)
}

export let easeInOutCubic = function (elapsed, initialValue, amountOfChange, duration) {
  if ((elapsed /= duration / 2) < 1) {
    return (amountOfChange / 2) * elapsed * elapsed * elapsed + initialValue
  }
  return (amountOfChange / 2) * ((elapsed -= 2) * elapsed * elapsed + 2) + initialValue
}

export let calcBoundingRectForObjects = function (objects, canvasRect) {
  // debugger
  if (objects.length === 0) return

  let minX = 99999,
    minY = 99999,
    maxX = 0,
    maxY = 0

  for (let obj of objects) {
    let objX, objY, objWidth, objHeight

    switch (obj.type) {
      case consts.OBJECT_GROUP:
        if (obj.children && obj.children.length > 0) {
          let childrenRect = calcBoundingRectForObjects(obj.children, canvasRect)
          objX = childrenRect.x
          objY = childrenRect.y
          objWidth = childrenRect.width
          objHeight = childrenRect.height
        }
        break
      case consts.OBJECT_SPOT:
        if (obj.default_style.use_icon) {
          objWidth = (obj.default_style.icon_size / canvasRect.width) * 100
          objHeight = (obj.default_style.icon_size / canvasRect.height) * 100
          objX = obj.x - objWidth / 2
          objY = obj.y - objHeight / 2

          if (obj.default_style.icon_is_pin) {
            objY -= objHeight / 2
          }
        } else {
          objWidth = (obj.width / canvasRect.width) * 100
          objHeight = (obj.height / canvasRect.height) * 100
          objX = obj.x - objWidth / 2
          objY = obj.y - objHeight / 2
        }

        break
      case consts.OBJECT_TEXT:
        let textRect = calcObjectRect(obj.id, canvasRect)
        objX = textRect.x
        objY = textRect.y
        objWidth = textRect.width
        objHeight = textRect.height
        break

      default:
        objX = obj.x
        objY = obj.y
        objWidth = obj.width
        objHeight = obj.height
    }

    if (objX < minX) minX = objX
    if (objX + objWidth > maxX) maxX = objX + objWidth
    if (objY < minY) minY = objY
    if (objY + objHeight > maxY) maxY = objY + objHeight
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  }
}

export let versionCompare = function (v1 = '1.0.0', v2 = '1.0.0', options) {
  var lexicographical = options && options.lexicographical,
    zeroExtend = options && options.zeroExtend,
    v1parts = v1.split('.'),
    v2parts = v2.split('.')

  function isValidPart(x) {
    return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x)
  }

  if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
    return NaN
  }

  if (zeroExtend) {
    while (v1parts.length < v2parts.length) v1parts.push('0')
    while (v2parts.length < v1parts.length) v2parts.push('0')
  }

  if (!lexicographical) {
    v1parts = v1parts.map(Number)
    v2parts = v2parts.map(Number)
  }

  for (var i = 0; i < v1parts.length; ++i) {
    if (v2parts.length == i) {
      return 1
    }

    if (v1parts[i] == v2parts[i]) {
      continue
    } else if (v1parts[i] > v2parts[i]) {
      return 1
    } else {
      return -1
    }
  }

  if (v1parts.length != v2parts.length) {
    return -1
  }

  return 0
}

export let timeSince = function (timestamp) {
  var seconds = Math.floor((new Date().getTime() - timestamp) / 1000)
  var interval = seconds / 31536000

  if (interval > 1) {
    return Math.floor(interval) + ' years'
  }
  interval = seconds / 2592000
  if (interval > 1) {
    return Math.floor(interval) + ' months'
  }
  interval = seconds / 86400
  if (interval > 1) {
    return Math.floor(interval) + ' days'
  }
  interval = seconds / 3600
  if (interval > 1) {
    return Math.floor(interval) + ' hours'
  }
  interval = seconds / 60
  if (interval > 1) {
    return Math.floor(interval) + ' minutes'
  }

  return Math.floor(seconds) + ' seconds'
}

export let Vector2 = function (x, y) {
  this.x = x
  this.y = y
}
Vector2.prototype.add = function (other) {
  return new Vector2(this.x + other.x, this.y + other.y)
}
Vector2.prototype.subtract = function (other) {
  return new Vector2(this.x - other.x, this.y - other.y)
}
Vector2.prototype.scale = function (scalar) {
  return new Vector2(this.x * scalar, this.y * scalar)
}
Vector2.prototype.normalized = function () {
  var magnitude = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2))
  return new Vector2(this.x / magnitude, this.y / magnitude)
}
Vector2.prototype.dot = function (other) {
  return this.x * other.x + this.y * other.y
}
Vector2.prototype.closestPointOnLine = function (pt1, pt2) {
  function dist2(pt1, pt2) {
    return Math.pow(pt1.x - pt2.x, 2) + Math.pow(pt1.y - pt2.y, 2)
  }

  var l2 = dist2(pt1, pt2)
  if (l2 == 0) return pt1

  var t = ((this.x - pt1.x) * (pt2.x - pt1.x) + (this.y - pt1.y) * (pt2.y - pt1.y)) / l2

  if (t < 0) return pt1
  if (t > 1) return pt2

  return new Vector2(pt1.x + t * (pt2.x - pt1.x), pt1.y + t * (pt2.y - pt1.y))
}
Vector2.prototype.vector2Args = function (x, y) {
  x = x || 0
  y = y || 0
  return [this.x + x, this.y + y]
}
function isEmpty(obj) {
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) return false
  }

  return true && JSON.stringify(obj) === JSON.stringify({})
}
function calcObjectRect(id, canvasRect) {
  // Get the bounding rect of the element and convert to %, relative to canvas
  let el = document.querySelector(`[data-canvas-object-id="${id}"] > div`)

  if (!el) {
    console.warn(`Could not get object rect: ${id}`)
    return {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    }
  }

  return {
    x: (el.offsetLeft / canvasRect.width) * 100,
    y: (el.offsetTop / canvasRect.height) * 100,
    width: (el.getBoundingClientRect().width / canvasRect.width) * 100,
    height: (el.getBoundingClientRect().height / canvasRect.height) * 100,
  }
}

export function getObjectIndexWithTitle(imageMapName, objectTitle) {
  let objectIndex = undefined

  for (let j = 0; j < ImageMapPro.instances[imageMapName].store.state.objects.length; j++) {
    if (ImageMapPro.instances[imageMapName].store.state.objects[j].title === objectTitle) {
      objectIndex = j
      break
    }
  }

  return objectIndex
}
export function getImageMapWithName(imageMapName) {
  for (let name in ImageMapPro.instances) {
    if (ImageMapPro.instances[name].store.state.general.name === imageMapName) {
      return ImageMapPro.instances[name]
    }
  }

  // Not found, return first image map
  // console.log('Image map with name "' + imageMapName + '" not found, returning the first found image map instead.')
  for (let name in ImageMapPro.instances) {
    return ImageMapPro.instances[name]
  }

  // No image maps, return undefined
  // console.log('Error: No image maps found!')
  return undefined
}
export function isPointInsidePolygon(x, y, vs) {
  // ray-casting algorithm based on
  // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

  let inside = false
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    let xi = vs[i][0]
    let yi = vs[i][1]
    let xj = vs[j][0]
    let yj = vs[j][1]

    let intersect = yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }

  return inside
}
export function isMobile() {
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    return true
  }

  return false
}
export function lerp(v0, v1, t) {
  return v0 * (1 - t) + v1 * t
}
export function easeOutBounce(x, t, b, c, d) {
  if ((t /= d) < 1 / 2.75) {
    return c * (7.5625 * t * t) + b
  } else if (t < 2 / 2.75) {
    return c * (7.5625 * (t -= 1.5 / 2.75) * t + 0.75) + b
  } else if (t < 2.5 / 2.75) {
    return c * (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375) + b
  } else {
    return c * (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375) + b
  }
}
export function loadImage(url, metadata) {
  return new Promise((resolve) => {
    {
      if (!url) resolve(false)
      const image = new Image()
      let handler = function () {
        resolve({ image, metadata })
      }
      image.addEventListener('load', handler.bind(metadata))
      image.src = url
    }
  })
}
export function preloadImage(url) {
  let img = new Image()
  img.src = url
  return img
}
export function isValidHttpUrl(string) {
  let url

  try {
    url = new URL(string)
  } catch (_) {
    return false
  }

  return url.protocol === 'http:' || url.protocol === 'https:'
}
export function traverseObjectTree(array, childrenArrayName, callback) {
  traverseRecursive(array, childrenArrayName, callback)
}
function traverseRecursive(array, childrenArrayName, callback) {
  for (let i = 0; i < array.length; i++) {
    let shouldBreak = callback(array[i], i, array)
    if (shouldBreak) return
    if (array[i][childrenArrayName] && array[i][childrenArrayName].length > 0) {
      traverseRecursive(array[i][childrenArrayName], childrenArrayName, callback)
    }
  }
}

// Debug purposes
export function drawPoint(x, y) {
  let el = document.createElement('div')
  el.style.left = x + 'px'
  el.style.top = y + 'px'
  el.style.width = '5px'
  el.style.height = '5px'
  el.style.backgroundColor = 'red'
  el.style.zIndex = 999999
  el.style.position = 'absolute'
  el.style.marginLeft = '-2.5px'
  el.style.marginTop = '-2.5px'

  document.body.appendChild(el)
}
