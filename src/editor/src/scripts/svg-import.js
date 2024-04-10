import { parse } from 'svg-parser'
import { objectDefaults } from 'Client/scripts/defaults'
import * as utilities from 'Editor/scripts/utilities'
import * as consts from 'Editor/scripts/consts'

// Create a temporary SVG node to get the width/height of nodes
let tempSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
tempSvg.style.position = 'fixed'
tempSvg.style.opacity = 0
tempSvg.style.zIndex = 0
tempSvg.style.left = 0
tempSvg.style.top = 0

export let SVGImport = function (xml, canvasWidth, canvasHeight) {
  // Append the SVG container that we will use to test
  // the object's width/height
  document.body.appendChild(tempSvg)

  // Parse
  let parsed = parse(extractSvgNode(xml))
  let obj = processNode(parsed, 0, 0, canvasWidth, canvasHeight)

  // Set the title of the root object
  obj.title = extractTitle(xml)

  // Fit to canvas
  obj = fitObjToCanvas(obj)

  // Remove the test SVG container
  document.body.removeChild(tempSvg)
  return obj
}
export let SVGImportAsSingle = function (xml, canvasWidth, canvasHeight) {
  let svg = extractSvgNode(xml)
  // Append the SVG container that we will use to test
  // the object's width/height
  document.body.appendChild(tempSvg)

  tempSvg.innerHTML = svg
  let bbox = tempSvg.getBBox()

  let obj = utilities.deepExtend({}, objectDefaults, {
    type: consts.OBJECT_SVG_SINGLE,
    id: utilities.uuidv4(),
    title: extractTitle(xml),
    width: ((bbox.width + bbox.x) / canvasWidth) * 100,
    height: ((bbox.height + bbox.y) / canvasHeight) * 100,
    svg: {
      html: svg,
      viewBox: `0 0 ${bbox.width + bbox.x} ${bbox.height + bbox.y}`
    },
  })

  // Fit to canvas
  obj = fitObjToCanvas(obj)

  // Remove the test SVG container
  document.body.removeChild(tempSvg)

  return obj
}

function fitObjToCanvas(obj) {
  let objWidth = 0
  let objHeight = 0

  // Find the total width/height of the obj group
  traverse(obj, traversedObj => {
    if (traversedObj.x + traversedObj.width > objWidth) objWidth = traversedObj.x + traversedObj.width
    if (traversedObj.y + traversedObj.height > objHeight) objHeight = traversedObj.y + traversedObj.height
  })

  // Determine scale ratio
  let scaleRatio = 1
  if (objWidth > 100 || objHeight > 100) {
    if (objWidth > objHeight) {
      scaleRatio = 1 / (objWidth / 100)
    } else {
      scaleRatio = 1 / (objHeight / 100)
    }
  }

  // Apply scale
  if (scaleRatio != 1) {
    traverse(obj, traversedObj => {
      traversedObj.x *= scaleRatio
      traversedObj.y *= scaleRatio
      traversedObj.width *= scaleRatio
      traversedObj.height *= scaleRatio
    })
  }

  return obj
}
function processNode(node, x, y, canvasWidth, canvasHeight, parentProperties = {}) {
  let obj = false

  if (node.type === 'root') {
    return processNode(node.children[0], x, y, canvasWidth, canvasHeight, parentProperties)
  }

  // Not supported
  if (node.tagName === 'title') return false
  if (node.tagName === 'style') return false
  if (node.tagName === 'font') return false
  if (node.tagName === 'font-face') return false
  if (node.tagName === 'desc') return false
  if (node.tagName === 'metadata') return false
  if (node.tagName === 'defs') return false
  if (node.tagName === 'use') return false

  // Group
  if (node.tagName === 'g' || node.tagName === 'svg') {
    let result = createGroup(node)

    x += result.x
    y += result.y
    obj = result.obj
    parentProperties = node.properties

    // Reverse children order, because in the editor objects are drawn from bottom to top
    for (let child of [...node.children].reverse()) {
      let processedChild = processNode(child, x, y, canvasWidth, canvasHeight, parentProperties)
      if (processedChild) obj.children.push(processedChild)
    }
  } else

  // Object
  {
    obj = createObject(node, x, y, canvasWidth, canvasHeight, parentProperties)
  }

  return obj
}
function createGroup(node) {
  let x = 0
  let y = 0

  // Create object
  let obj = utilities.deepExtend({}, objectDefaults, {
    id: utilities.uuidv4(),
    type: consts.OBJECT_GROUP,
    title: node.properties?.id || 'Imported Group',
    svg: { html: nodeToHTML(node) },
    children: []
  })

  // Apply the group's translate to all children as obj.x / obj.y offsets
  if (node.properties?.transform) {
    let matches = [...node.properties.transform.matchAll(/translate\(([\d\.]+), ([\d\.]+)\)/g)][0]
    if (matches) {
      x = parseFloat(matches[1])
      y = parseFloat(matches[2])
    }
  }

  return {
    obj,
    x,
    y
  }
}
function createObject(node, x, y, canvasWidth, canvasHeight, parentProperties) {
  tempSvg.innerHTML = nodeToHTML(node)
  let bbox = tempSvg.getBBox()

  // Create object
  let obj = utilities.deepExtend({}, objectDefaults, {
    type: consts.OBJECT_SVG,
    id: utilities.uuidv4(),
    x: ((bbox.x + x) / canvasWidth) * 100,
    y: ((bbox.y + y) / canvasHeight) * 100,
    width: ((bbox.width) / canvasWidth) * 100,
    height: ((bbox.height) / canvasHeight) * 100,
    title: node.properties?.id || node.tagName,
    default_style: {
      background_opacity: 1,
      stroke_opacity: 1
    },
    svg: {
      tagName: node.tagName,
      properties: {},
      viewBox: `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`
    }
  })

  // Copy style props from parent
  for (let propName in parentProperties) {
    if (propName === 'fill') obj.default_style.background_color = parentProperties[propName]
    if (propName === 'fill-opacity') obj.default_style.background_opacity = parentProperties[propName]
    if (propName === 'stroke') obj.default_style.stroke_color = parentProperties[propName]
    if (propName === 'stroke-opacity') obj.default_style.stroke_opacity = parentProperties[propName]
    if (propName === 'stroke-width') obj.default_style.stroke_width = parentProperties[propName]
    if (propName === 'stroke-dasharray') obj.default_style.stroke_dasharray = parentProperties[propName]
    if (propName === 'stroke-linecap') obj.default_style.stroke_linecap = parentProperties[propName]
  }

  // Copy style props
  // If a prop is not style, put it in svg properties
  for (let propName in node.properties) {
    if (propName === 'fill') {
      obj.default_style.background_color = node.properties[propName]
      continue
    }
    if (propName === 'fill-opacity') {
      obj.default_style.background_opacity = node.properties[propName]
      continue
    }
    if (propName === 'stroke') {
      obj.default_style.stroke_color = node.properties[propName]
      continue
    }
    if (propName === 'stroke-opacity') {
      obj.default_style.stroke_opacity = node.properties[propName]
      continue
    }
    if (propName === 'stroke-width') {
      obj.default_style.stroke_width = node.properties[propName]
      continue
    }
    if (propName === 'stroke-dasharray') {
      obj.default_style.stroke_dasharray = node.properties[propName]
      continue
    }
    if (propName === 'stroke-linecap') {
      obj.default_style.stroke_linecap = node.properties[propName]
      continue
    }

    obj.svg.properties.push({
      name: propName,
      value: node.properties[propName]
    })
  }

  // Make mouseover styles the same as default styles
  obj.mouseover_style.background_color = obj.default_style.background_color
  obj.mouseover_style.background_opacity = obj.default_style.background_opacity
  obj.mouseover_style.stroke_color = obj.default_style.stroke_color
  obj.mouseover_style.stroke_opacity = obj.default_style.stroke_opacity
  obj.mouseover_style.stroke_width = obj.default_style.stroke_width
  obj.mouseover_style.stroke_dasharray = obj.default_style.stroke_dasharray
  obj.mouseover_style.stroke_linecap = obj.default_style.stroke_linecap

  return obj
}

function extractSvgNode(xml) {
  let svgRegex = /<svg[^>]*>([\S\s]+)<\/svg>/g
  return svgRegex.exec(xml)[1]
}
function extractTitle(xml) {
  let titleRegex = /<title[^>]*>([\S\s]+)<\/title>/g
  let titleMatches = titleRegex.exec(xml)
  return titleMatches ? titleMatches[1] : 'Imported'
}
function nodeToHTML(node) {
  let props = ''

  for (let propName in node.properties) {
    props += `${propName}="${node.properties[propName]}" `
  }

  let html = `<${node.tagName} ${props}></${node.tagName}>`
  return html
}
function traverse(obj, cb) {
  cb(obj)

  if (obj.children) {
    for (let child of obj.children) {
      traverse(child, cb)
    }
  }
}