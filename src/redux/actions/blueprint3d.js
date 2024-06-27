import { engineAction } from '../actionTypes'

export const engineLoadInitiate = (data, history) => ({
  type: engineAction.ENGINE_LOAD_INITIATE,
  payload: data,
  history,
});

export const engineLoadSuccess = (data) => ({
  type: engineAction.ENGINE_LOAD_SUCCESS,
  payload: data,
});

export const engineLoadFailure = (error) => ({
  type: engineAction.ENGINE_LOAD_FAILURE,
  payload: error,
})

export const updateEngineStatesAction = (data, key) => ({
  type: engineAction.UPDATE_ENGINE_STATE,
  payload: data,
  key
})
