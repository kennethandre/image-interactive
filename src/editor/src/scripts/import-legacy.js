import parseContent from 'Client/scripts/squaresContentParser'
import * as consts from 'Editor/scripts/consts'
import * as utilities from 'Editor/scripts/utilities'
import * as defaults from 'Client/scripts/defaults'

export let importLegacy = function (settings) {
  settings = utilities.deepExtend({}, defaults_image_map_legacy, settings)

  // Image Map settings
  let result = parseImageMapSettings(settings)

  // Parse spots
  let parsedObjects = []
  let layerIdForObjectId = {}

  // Reverse order
  settings.spots = settings.spots.reverse()

  if (settings.spots?.length > 0) {
    // Expand settings
    for (let index in settings.spots) {
      settings.spots[index] = utilities.deepExtend({}, defaults_shape_legacy, settings.spots[index])
    }

    // Parse objects
    for (let shapeRaw of settings.spots) {
      parsedObjects.push(parseObjectSettings(shapeRaw, settings))
      layerIdForObjectId[shapeRaw.id] = shapeRaw.layerID + ''
    }

    // Build model of groupedIds
    // groupedIds[masterId] = [...all slave IDs + the master ID]
    let groupedIds
    for (let shape of settings.spots) {
      if (shape.connected_to) {
        if (!groupedIds) groupedIds = {}
        if (!groupedIds[shape.connected_to]) groupedIds[shape.connected_to] = [shape.connected_to]
        groupedIds[shape.connected_to].push(shape.id)
      }
    }

    // Rebuild object hierarchy if there are groupedIds
    if (groupedIds) {
      let groupObjectsById = {}

      // Create group objects
      for (let masterId in groupedIds) {
        // Create group
        let newGroup = utilities.deepExtend({}, defaults.objectDefaults)
        newGroup.id = utilities.uuidv4()
        newGroup.type = consts.OBJECT_GROUP
        newGroup.title = settings.spots.filter(o => o.id === masterId)[0].title
        newGroup.tooltip_style = settings.spots.filter(o => o.id === masterId)[0].tooltip_style
        newGroup.tooltip_content = parseContent(settings.spots.filter(o => o.id === masterId)[0].tooltip_content)
        newGroup.single_object = true

        // Remember the layer ID of the master object
        layerIdForObjectId[newGroup.id] = settings.spots.filter(o => o.id === masterId)[0].layerID + ''

        // Put all objects with IDs that are in that group's groupedIds
        newGroup.children = parsedObjects.filter(o => groupedIds[masterId].includes(o.id))

        // Put the group in a temp assoc array
        groupObjectsById[masterId] = newGroup
      }

      // Build the final object list
      let objects = []
      for (let spot of settings.spots) {
        // Slave, do nothing
        if (spot.connected_to) continue

        // Master, insert the group
        if (groupObjectsById[spot.id]) {
          objects.push(groupObjectsById[spot.id])
          continue
        }

        // Normal object, insert it
        objects.push(parsedObjects.filter(o => o.id === spot.id)[0])
      }

      parsedObjects = objects
    }
  }

  // Artboards
  if (settings.layers?.layers_list?.length > 0) {
    result.artboards = []
    for (let layer of settings.layers?.layers_list) {
      let newArtboard = utilities.deepExtend({}, defaults.artboardDefaults)
      newArtboard.id = utilities.uuidv4()
      newArtboard.title = layer.title
      newArtboard.image_url = layer.image_url
      newArtboard.width = layer.image_width
      newArtboard.height = layer.image_height

      if (newArtboard.image_url) {
        newArtboard.background_type = 'image'
      } else {
        newArtboard.background_type = 'color'
      }

      newArtboard.children = parsedObjects.filter(o => layerIdForObjectId[o.id] === (layer.id + ''))

      result.artboards.push(newArtboard)
    }
  } else {
    result.artboards = [utilities.deepExtend({}, defaults.artboardDefaults)]
    result.artboards[0].id = utilities.uuidv4()
    result.artboards[0].title = settings.general.name
    result.artboards[0].width = settings.general.width || result.artboards[0].width
    result.artboards[0].height = settings.general.height || result.artboards[0].height
    result.artboards[0].background_type = 'image'
    result.artboards[0].image_url = settings.image.url
    result.artboards[0].children = parsedObjects
  }

  // Update parent IDs
  result.artboards.forEach(artboard => {
    updateSingleObjectParentsAndFilters(artboard.children)
  })

  return result
}

function parseImageMapSettings(settings) {
  let result = {
    id: settings.id,
    general: {
      name: settings.general.name,
      shortcode: settings.general.shortcode,
      responsive: isTrue(settings.general.responsive)
    },
    fullscreen: {
      enable_fullscreen_mode: isTrue(settings.general.responsive),
      start_in_fullscreen_mode: isTrue(settings.general.start_in_fullscreen_mode),
    },
    objectConfig: {
      pageload_animation: settings.shapes.pageload_animation,
      glowing_objects: settings.shapes.glowing_shapes,
      glowing_objects_color: settings.shapes.glowing_shapes_color,
      glow_opacity: settings.shapes.glow_opacity,
      stop_glowing_on_mouseover: settings.shapes.stop_glowing_on_mouseover,
      scale_spots: defaults.imageMapDefaults.objectConfig.scale_spots
    },
    tooltips: {
      enable_tooltips: isTrue(settings.tooltips.enable_tooltips),
      show_tooltips: settings.tooltips.show_tooltips,
      sticky_tooltips: isTrue(settings.tooltips.sticky_tooltips),
      constrain_tooltips: isTrue(settings.tooltips.constrain_tooltips),
      tooltip_animation: settings.tooltips.tooltip_animation,
      fullscreen_tooltips: settings.tooltips.fullscreen_tooltips,
      // New settings
      fullscreen_background: defaults.imageMapDefaults.tooltips.fullscreen_background,
      fullscreen_background_opacity: defaults.imageMapDefaults.tooltips.fullscreen_background_opacity,
    },
    zooming: {
      enable_zooming: isTrue(settings.zooming.enable_zooming),
      max_zoom: settings.zooming.max_zoom,
      limit_max_zoom_to_image_size: isTrue(settings.zooming.limit_max_zoom_to_image_size),
      enable_zoom_buttons: isTrue(settings.zooming.enable_zoom_buttons),
      enable_navigator: isTrue(settings.zooming.enable_navigator),
      hold_ctrl_to_zoom: isTrue(settings.zooming.hold_ctrl_to_zoom),
      zoom_on_object_click: isTrue(settings.zooming.focus_shape_on_click)
    },
    object_list: {
      enable_object_list: isTrue(settings.shapes_menu.enable_shapes_menu),
      detached_menu: isTrue(settings.shapes_menu.detached_menu),
      menu_position: settings.shapes_menu.menu_position,
      enable_search: isTrue(settings.shapes_menu.enable_search),
      group_by_artboard: isTrue(settings.shapes_menu.group_by_floor),
      show_only_objects_from_active_artboard: defaults.imageMapDefaults.object_list.show_only_objects_from_active_artboard
    },
    custom_code: {
      custom_css: settings.custom_code.custom_css,
      custom_js: settings.custom_code.custom_js
    },
    defaults: {
      objectDefaults: {}
    },
    artboards: []
  }

  return result
}

function parseObjectSettings(shapeRaw, settings) {
  let shape = shapeRaw

  let parsedObject = {
    id: shape.id,
    title: shape.title,
    type: shape.type,
    x: shape.x,
    y: shape.y,
    width: shape.width,
    height: shape.height,
    static: isTrue(shape.static),
    children: [],
    group_settings: {
      single_object: false,
    },
    default_style: {
      opacity: shape.default_style.opacity,
      background_type: shape.default_style.background_type,
      background_color: shape.default_style.background_color,
      background_opacity: shape.default_style.background_opacity,
      border_radius: shape.default_style.border_radius,
      border_width: shape.default_style.border_width,
      border_style: shape.default_style.border_style,
      border_color: shape.default_style.border_color,
      border_opacity: shape.default_style.border_opacity,
      background_image_url: shape.default_style.background_image_url,
      background_image_opacity: shape.default_style.background_image_opacity,
      background_image_scale: shape.default_style.background_image_scale,
      background_image_offset_x: shape.default_style.background_image_offset_x,
      background_image_offset_y: shape.default_style.background_image_offset_y,
      stroke_color: shape.default_style.stroke_color,
      stroke_opacity: shape.default_style.stroke_opacity,
      stroke_width: shape.default_style.stroke_width,
      stroke_dasharray: shape.default_style.stroke_dasharray,
      stroke_linecap: shape.default_style.stroke_linecap,
      use_icon: isTrue(shape.default_style.use_icon),
      icon_size: shape.height,
      icon_type: shape.default_style.icon_type,
      icon_fontawesome_id: shape.default_style.icon_fontawesome_id,
      icon_svg: defaults.objectDefaults.default_style.icon_svg,
      icon_fill: shape.default_style.icon_fill,
      icon_url: shape.default_style.icon_url,
      icon_is_pin: isTrue(shape.default_style.icon_is_pin),
      icon_shadow: isTrue(shape.default_style.icon_shadow),
      filters: []
    },
    mouseover_style: {
      opacity: shape.mouseover_style.opacity,
      background_color: shape.mouseover_style.background_color,
      background_opacity: shape.mouseover_style.background_opacity,
      background_image_url: shape.mouseover_style.background_image_url,
      background_image_opacity: shape.mouseover_style.background_image_opacity,
      background_image_scale: shape.mouseover_style.background_image_scale,
      background_image_offset_x: shape.mouseover_style.background_image_offset_x,
      background_image_offset_y: shape.mouseover_style.background_image_offset_y,
      border_radius: shape.mouseover_style.border_radius,
      border_width: shape.mouseover_style.border_width,
      border_style: shape.mouseover_style.border_style,
      border_color: shape.mouseover_style.border_color,
      border_opacity: shape.mouseover_style.border_opacity,
      stroke_color: shape.mouseover_style.stroke_color,
      stroke_opacity: shape.mouseover_style.stroke_opacity,
      stroke_width: shape.mouseover_style.stroke_width,
      stroke_dasharray: shape.mouseover_style.stroke_dasharray,
      stroke_linecap: shape.mouseover_style.stroke_linecap,
      icon_fill: shape.mouseover_style.icon_fill,
      filters: []
    },
    tooltip: {
      enable_tooltip: isTrue(shape.tooltip.enable_tooltip),
    },
    tooltip_style: {
      border_radius: shape.tooltip_style.border_radius,
      padding: shape.tooltip_style.padding,
      background_color: shape.tooltip_style.background_color,
      background_opacity: shape.tooltip_style.background_opacity,
      position: shape.tooltip_style.position,
      width: shape.tooltip_style.width,
      auto_width: isTrue(shape.tooltip_style.auto_width),
      offset_x: shape.tooltip_style.offset_x,
      offset_y: shape.tooltip_style.offset_y,
    },
    tooltip_content: parseContent(shape.tooltip_content),
    text: {
      text: shape.text.text,
      font_family: shape.text.font_family,
      font_size: shape.text.font_size,
      font_weight: shape.text.font_weight,
      text_color: shape.text.text_color,
      text_opacity: shape.text.text_opacity,
    },
    actions: {
      click: shape.actions.click,
      link: shape.actions.link,
      open_link_in_new_window: shape.actions.open_link_in_new_window,
      script: shape.actions.script,
    },

    // Image background
    x_image_background: shape.x_image_background,
    y_image_background: shape.y_image_background,
    width_image_background: shape.width_image_background,
    height_image_background: shape.height_image_background,

    // Poly
    points: shape.points,

    // SVG
    svg: {
      html: '',
      tagName: '',
      properties: {},
      viewBox: ''
    }
  }

  // Type - path
  if (shape.type === 'path') {
    parsedObject.type = consts.OBJECT_SVG_SINGLE

    let canvasSize = getCanvasSize(settings)
    let html = getHTMLForPath(shape)
    let bbox = getBBoxForPath(html)
    parsedObject.width = ((bbox.width) / canvasSize.width) * 100
    parsedObject.height = ((bbox.height) / canvasSize.height) * 100
    parsedObject.svg.html = html
    parsedObject.svg.viewBox = `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`
    parsedObject.default_style.filters = generateFiltersFromStyle(parsedObject.default_style)
    parsedObject.mouseover_style.filters = generateFiltersFromStyle(parsedObject.mouseover_style)
  }

  return parsedObject
}

function getCanvasSize(settings) {
  if (settings.layers?.layers_list?.length > 0) {
    for (let layer of settings.layers.layers_list) {
      if (layer.id === shape.layerID) {
        return {
          width: layer.image_width,
          height: layer.image_height
        }
      }
    }
  } else {
    return {
      width: settings.general.width,
      height: settings.general.height,
    }
  }
}

function getHTMLForPath(shape) {
  let stroke = utilities.hexToRgb(shape.default_style.stroke_color)
  return `<path d="${shape.d}" fill="hsl(0, 100%, 50%)" stroke="rgba(${stroke.r}, ${stroke.g}, ${stroke.b}, ${shape.default_style.stroke_opacity})" stroke-width="${shape.default_style.stroke_width}px"></path>`
}

function getBBoxForPath(pathHtml) {
  let tempSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  tempSvg.style.position = 'fixed'
  tempSvg.style.opacity = 1
  tempSvg.style.left = 0
  tempSvg.style.top = 0
  document.body.appendChild(tempSvg)
  tempSvg.innerHTML = pathHtml
  let bbox = tempSvg.getBBox()
  // document.body.removeChild(tempSvg)
  return bbox
}

function generateFiltersFromStyle(style) {
  let hslDefault = utilities.hexToHSL('#ff0000')
  let hsl = utilities.hexToHSL(style.background_color)
  return [
    {
      id: utilities.uuidv4(),
      name: 'brightness',
      value: 1 - (hslDefault.l - hsl.l) / 100
    },
    {
      id: utilities.uuidv4(),
      name: 'hue-rotate',
      value: hsl.h + 'deg'
    },
  ]
}

function updateSingleObjectParentsAndFilters(objects, callback = () => { }, parentId = '', parentObject) {
  for (let obj of objects) {

    // Update the object's parent_id and parent_filters
    if (obj.type !== consts.OBJECT_ARTBOARD) {
      obj.parent_id = parentId
      if (parentId !== '') {
        obj.default_style.parent_filters = parentObject.default_style.filters
        obj.mouseover_style.parent_filters = parentObject.mouseover_style.filters
      } else {
        obj.default_style.parent_filters = []
        obj.mouseover_style.parent_filters = []
      }
    }

    if (obj.children) {

      // Determine the next child's parent_id and parent object
      let childParentId = obj.single_object && parentId === '' ? obj.id : parentId
      let childParentObject = obj.single_object && parentId === '' ? obj : parentObject

      updateSingleObjectParentsAndFilters(obj.children, callback, childParentId, childParentObject)
    }
    if (callback(obj, parent)) break
  }
}

function isTrue(v) {
  if (v) return true
  return false
}

let defaults_image_map_legacy = {
  id: 0,
  editor: {
    previewMode: 0,
    selected_shape: -1,
    transform_tooltip_mode: 0,
    tool: 'spot',
    zoom: 1,
    currentLayer: 0,
    state: {
      dragging: false
    },
    shapeCounter: {
      spots: 0,
      rects: 0,
      ovals: 0,
      polys: 0,
      texts: 0,
      paths: 0
    }
  },
  runtime: {
    is_fullscreen: 0,
    layerID: 0,
    menu_search_string: '',
    menu_scroll: 0
  },
  general: {
    name: '',
    shortcode: '',
    width: 800,
    height: 450,
    naturalWidth: 800,
    naturalHeight: 450,
    responsive: 1,
    preserve_quality: 1,
    center_image_map: 0
  },
  image: {
    // url: 'https://imagemappro.com/uploads/editor/default-image-blank.png',
    url: '',
  },
  fullscreen: {
    enable_fullscreen_mode: 0,
    start_in_fullscreen_mode: 0,
    fullscreen_background: '#000000',
    fullscreen_button_position: 1,
    fullscreen_button_type: 'icon_and_text',
    fullscreen_button_color: '#ffffff',
    fullscreen_button_text_color: '#222222'
  },
  shapes: {
    pageload_animation: 'none', // none, grow, fade, fall-down
    glowing_shapes: 0,
    glowing_shapes_color: '#ffffff',
    glow_opacity: 0.5,
    stop_glowing_on_mouseover: 1
  },
  tooltips: {
    enable_tooltips: 1,
    show_tooltips: 'mouseover', // mouseover/click
    show_title_on_mouseover: 0, // Appears only when show_tooltips is set to click
    sticky_tooltips: 0,
    constrain_tooltips: 1,
    tooltip_animation: 'none',
    fullscreen_tooltips: 'mobile-only', // none / mobile-only / always,
  },
  zooming: {
    enable_zooming: 0,
    max_zoom: 16,
    limit_max_zoom_to_image_size: 0,
    enable_zoom_buttons: 1,
    enable_navigator: 1,
    hold_ctrl_to_zoom: 1,
    focus_shape_on_click: 1
  },
  layers: {
    enable_layers: 0,
    layers_list: [],
    /* Example:
      [
        {
          id: 0,
          title: 'Main Layer',
          image_url: 'img/floor1.jpg',
          image_width: 800,
          image_height: 600
        }
      ]
    */
  },
  shapes_menu: {
    enable_shapes_menu: 0,
    detached_menu: 0,
    menu_position: 'left', // left/right
    enable_search: 1,
    group_by_floor: 0,
    hide_children_of_connected_shapes: 1
  },
  custom_code: {
    custom_css: '',
    custom_js: ''
  },
  spots: []
}

let defaults_shape_legacy = {
  id: 'spot-0',
  title: '',
  type: 'spot', // spot, rect, oval, poly, text
  x: -1,
  y: -1,
  width: 44,
  height: 44,
  x_image_background: -1,
  y_image_background: -1,
  width_image_background: 44,
  height_image_background: 44,
  connected_to: '',
  use_connected_shape_tooltip: 0,
  layerID: 0,
  static: 0,
  text: {
    text: 'Text',
    font_family: 'sans-serif',
    font_size: 16,
    font_weight: 400,
    text_color: '#000000',
    text_opacity: 1
  },
  actions: {
    click: 'no-action',
    link: '#',
    open_link_in_new_window: 1,
    script: ''
  },
  default_style: {
    opacity: 1,
    border_radius: 50,
    background_type: 'color', // color / image
    background_image_url: '',
    background_image_opacity: 1,
    background_image_scale: 1, // 0-2
    background_image_offset_x: 0,
    background_image_offset_y: 0,
    background_color: '#000000',
    background_opacity: 0.4,
    border_width: 0,
    border_style: 'solid',
    border_color: '#ffffff',
    border_opacity: 1,

    // poly-specific
    // fill: '#000000',
    // fill_opacity: 0.4,
    stroke_color: '#ffffff',
    stroke_opacity: 0.75,
    stroke_width: 0,
    stroke_dasharray: '0',
    stroke_linecap: 'round',

    // spot-specific
    use_icon: 1,
    icon_type: 'library', // or 'custom'
    /* deprecated */ icon_svg_path: 'M409.81,160.113C409.79,71.684,338.136,0,249.725,0C161.276,0,89.583,71.684,89.583,160.113     c0,76.325,119.274,280.238,151.955,334.638c1.72,2.882,4.826,4.641,8.178,4.641c3.351,0,6.468-1.759,8.168-4.631     C290.545,440.361,409.81,236.438,409.81,160.113z M249.716,283.999c-68.303,0-123.915-55.573-123.915-123.895     c0-68.313,55.592-123.895,123.915-123.895s123.876,55.582,123.876,123.895S318.029,283.999,249.716,283.999z',
    /* deprecated */ icon_svg_viewbox: '0 0 499.392 499.392',
    icon_fontawesome_id: 'map-marker',
    icon_fill: '#000000',
    icon_url: '',
    icon_is_pin: 1,
    icon_shadow: 0
  },
  mouseover_style: {
    opacity: 1,
    border_radius: 50,
    background_image_url: '',
    background_image_opacity: 1,
    background_image_scale: 1,
    background_image_offset_x: 0,
    background_image_offset_y: 0,
    background_color: '#ffffff',
    background_opacity: 0.4,
    border_width: 0,
    border_style: 'solid',
    border_color: '#ffffff',
    border_opacity: 1,

    // poly-specific
    // fill: '#ffffff',
    // fill_opacity: 0.4,
    stroke_color: '#ffffff',
    stroke_opacity: 0.75,
    stroke_width: 0,
    stroke_dasharray: '0',
    stroke_linecap: 'round',

    // spot-specific
    icon_fill: '#000000'
  },
  tooltip: {
    enable_tooltip: 1,
  },
  tooltip_style: {
    // enable_tooltip: 1,
    buffer: 40,
    border_radius: 10,
    padding: 15,
    background_color: '#222222',
    background_opacity: 1,
    position: 'top',
    width: 225,
    auto_width: 1,

    // 5.0
    offset_x: 0,
    offset_y: 0
  },
  tooltip_content: {
    // content_type: 'content-builder', // plain-text / content-builder
    // plain_text: 'Example Text',
    // plain_text_color: '#ffffff',
    squares_settings: {
      containers: [{
        id: "sq-container-403761",
        settings: {
          elements: [
            {
              "settings": {
                "name": "Heading",
                "iconClass": "fa fa-header"
              },
              "options": {
                "heading": {
                  "text": "My Shape"
                }
              }
            }
          ]
        }
      }]
    }
  },
  points: [],
  vs: [],
  svgPathCommands: [],
  d: '',
  dEditor: ''
}