import { configureStore } from '@reduxjs/toolkit'
import mapReducer from 'Editor/store/sliceMap'
import undoable, { groupByActionTypes } from 'redux-undo'
import { ActionCreators } from 'redux-undo'
import * as consts from 'Editor/scripts/consts'
import * as gettersImport from 'Editor/store/getters'
import * as settersImport from 'Editor/store/setters'
import { selected } from 'Editor/store/ui'

const crashReporter = store => next => action => {
  try {
    return next(action)
  } catch (err) {
    console.error('Caught an exception!')
    console.error(err)
    let e = new Event(consts.EVENT_BUG_REPORT)
    e.detail = { action }
    document.dispatchEvent(e)
  }
}

export const store = configureStore({
  reducer: {
    map: undoable(mapReducer, {
      limit: 50
    }),
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(crashReporter)
})

export const getters = gettersImport
export const setters = settersImport

document.addEventListener(consts.EVENT_UNDO, () => {
  let prevState = store.getState().map.past[store.getState().map.past.length - 1]
  validateSelectionForState(prevState)

  store.dispatch(ActionCreators.undo())
})
document.addEventListener(consts.EVENT_REDO, () => {
  let nextState = store.getState().map.future[0]
  validateSelectionForState(nextState)

  store.dispatch(ActionCreators.redo())
})

function validateSelectionForState(state) {
  selected.update(objIds => {
    let result = []
    for (let id of objIds) {
      if (getters.getObject(id, state.artboards) !== undefined) result.push(id)
    }
    return result
  })
}