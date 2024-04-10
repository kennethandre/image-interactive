if (!window.imageMapProConfig) window.imageMapProConfig = {}

let getSavesDone = null
export function getSaves(done) {
  if (window.imageMapProConfig.wp === true) {
    getSavesDone = done
    window.parent.postMessage(JSON.stringify({
      action: 'getSaves'
    }), '*')
  } else {
    let result = window.localStorage.imageMapProSaves || '[]'
    try {
      result = JSON.parse(result)
    } catch (err) {
      console.log(err)
      done(undefined)
    }
    done(result)
  }
}

let saveDone = null
export function save(data, done) {
  data.lastSaved = new Date().getTime()

  if (window.imageMapProConfig.wp === true) {
    saveDone = done
    window.parent.postMessage(JSON.stringify({
      action: 'save',
      json: JSON.stringify(data),
      name: data.general.name,
      id: data.id,
      shortcode: data.general.shortcode
    }), '*')
  } else {
    getSaves(saves => {
      let index = saves.findIndex(o => o.id + '' === data.id + '')
      if (index !== -1) {
        saves[index] = data
      } else {
        saves.push(data)
      }

      window.localStorage.imageMapProSaves = JSON.stringify(saves)
      window.localStorage.imageMapProLastSave = data.id

      setTimeout(() => {
        done(true)
      }, 500)
    })
  }
}

let deleteSaveDone = null
export function deleteSave(id, done) {
  getSaves((saves) => {
    if (window.imageMapProConfig.wp === true) {
      deleteSaveDone = done
      window.parent.postMessage(JSON.stringify({
        action: 'deleteSave',
        id
      }), '*')
    } else {
      saves = saves.filter(o => o.id + '' !== id + '')
      window.localStorage.imageMapProSaves = JSON.stringify(saves)
      setTimeout(() => {
        done()
      }, 500)
    }
  })
}

export function setLastSave(id) {
  if (window.imageMapProConfig.wp === true) {
    // Ajax
  } else {
    window.localStorage.imageMapProLastSave = id
  }
}

let getLastSaveDone = null
export function getLastSave(done) {
  if (window.imageMapProConfig.wp === true) {
    getLastSaveDone = done
    window.parent.postMessage(JSON.stringify({
      action: 'getLastSave'
    }), '*')
  } else {
    if (window.localStorage.imageMapProLastSave) {
      getSaves(saves => {
        done(saves.filter(o => o.id + '' === window.localStorage.imageMapProLastSave + '')[0])
      })
    } else {
      done(false)
    }
  }
}

window.addEventListener('message', e => {
  try {
    const data = JSON.parse(e.data)

    if (data.action === 'getLastSave') {
      if (getLastSaveDone) getLastSaveDone(data.map)
    }
    if (data.action === 'getSaves') {
      if (getSavesDone) getSavesDone(data.maps)
    }
    if (data.action === 'save') {
      if (saveDone) saveDone(data.result === 'success')
    }
    if (data.action === 'deleteSave') {
      if (deleteSaveDone) deleteSaveDone(data.result === 'success')
    }
  } catch (err) {

  }
})