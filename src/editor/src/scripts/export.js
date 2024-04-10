import * as utilities from 'Editor/scripts/utilities'
import * as defaults from 'Client/scripts/defaults'

export function exportSettings(settings) {
  let artboards = []

  for (let artboard of settings.artboards) {
    let compressedArtboard = utilities.deepExtend({}, utilities.subtract(artboard, defaults.artboardDefaults))
    compressedArtboard.children = compressObjects(artboard.children)
    compressedArtboard = utilities.clean(compressedArtboard) || {}
    artboards.push(compressedArtboard)
  }

  let compressed = utilities.deepExtend({}, utilities.clean(utilities.subtract(settings, defaults.imageMapDefaults)))
  compressed.artboards = artboards
  compressed.version = __VERSION__
  compressed.general = compressed.general || {}
  compressed.general.name = settings.general.name
  return compressed
}

function compressObjects(objects) {
  let result = []

  if (objects) {
    for (let object of objects) {
      let compressedObject = utilities.deepExtend(
        {},
        utilities.clean(utilities.subtract(object, defaults.objectDefaults))
      )
      compressedObject.children = compressObjects(object.children)
      result.push(compressedObject)
    }
  }

  return result
}
