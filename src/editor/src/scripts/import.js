import * as utilities from 'Editor/scripts/utilities'
import * as defaults from 'Client/scripts/defaults'
import * as consts from 'Editor/scripts/consts'
import { importLegacy } from 'Editor/scripts/import-legacy'

export function importSettings(settings) {
  let parsed = parseSettings(settings)
  let extended = extend(parsed)

  extended.artboards = modifyObjects(extended.artboards)
  return extended
}

function extend(settings) {
  let extended = utilities.deepExtend({}, defaults.imageMapDefaults, settings)
  extended.artboards = extendArtboards(extended.artboards)
  return extended
}

function extendArtboards(artboards) {
  let extendedArtboards = []

  if (artboards.length === 0) {
    artboards = [utilities.deepExtend({}, defaults.artboardDefaults)]
  }

  for (let artboard of artboards) {
    let extendedArtboard = utilities.deepExtend({}, defaults.artboardDefaults, artboard)
    extendedArtboard.children = extendObjects(artboard.children)
    extendedArtboards.push(extendedArtboard)
  }

  return extendedArtboards
}

function extendObjects(objects) {
  let result = []
  if (objects) {
    for (let object of objects) {
      let extendedObject = utilities.deepExtend({}, defaults.objectDefaults, object)
      extendedObject.children = extendObjects(object.children)
      result.push(extendedObject)
    }
  }

  return result
}

function parseSettings(settings) {
  /*
  if v1 > v2 => 1
  if v1 < v2 => -1
  if v1 = v2 => 0
  */

  // If the version is current, return settings
  if (utilities.versionCompare(__VERSION__, settings.version) === 0) return settings

  let result = utilities.deepExtend({}, settings)

  // If there is no version, it means the settings are pre-6.0.0
  // do a full parse and bring the settings up to 6.0.0
  if (!settings.version) {
    result = importLegacy(settings)
  }

  // Example 1:
  // If there is a breaking change in 6.1.0, add this check
  // and assume the settings are up to date with the previous block (6.0.0)
  // if (utilities.versionCompare(settings.version, '6.1.0') === -1) { }

  // Example 2:
  // If there is a breaking change in 6.2.0, add this check
  // and assume the settings are up to date with the previous block (6.1.0)
  // if (utilities.versionCompare(settings.version, '6.2.0') === -1) { }

  // Done
  // Apply the current version to the already parsed settings
  result.version = __VERSION__

  return result
}

function modifyObjects(objects) {
  for (let obj of objects) {
    if (obj.type !== consts.OBJECT_ARTBOARD) {
      // Don't show empty tooltips
      if (obj.tooltip_content.length === 0) obj.tooltip.enable_tooltip = false
    }
    if (obj.children) modifyObjects(obj.children)
  }

  return objects
}
