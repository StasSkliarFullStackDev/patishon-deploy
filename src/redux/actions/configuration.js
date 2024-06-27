import { configurationAction } from '../actionTypes'

export const getRoomSizeInitiate = (data, history) => ({
  type: configurationAction.GET_ROOM_SIZE_INITIATE,
  payload: data,
  history,
});

export const getRoomSizeSuccess = (data) => ({
  type: configurationAction.GET_ROOM_SIZE_SUCCESS,
  payload: data,
});

export const getRoomSizeFailure = (error) => ({
  type: configurationAction.GET_ROOM_SIZE_FAILURE,
  payload: error,
})

export const getHingesInitiate = () => ({
  type: configurationAction.GET_HINGES_INITIATE,
});

export const getHingesSuccess = () => ({
  type: configurationAction.GET_HINGES_SUCCESS,
});

export const getHingesFailure = (error) => ({
  type: configurationAction.GET_HINGES_FAILURE,
  payload: error,
})

export const placeOrderInitiate = (data) => ({
  type: configurationAction.PLACE_ORDER_INITIATE,
  payload: data
});

export const placeOrderSuccess = (data) => ({
  type: configurationAction.PLACE_ORDER_SUCCESS,
  payload: data
});

export const placeOrderFailure = (error) => ({
  type: configurationAction.PLACE_ORDER_FAILURE,
  payload: error,
})


export const updateConfigurationStates = (data, key) => ({
  type: configurationAction.UPDATE_CONFIGURATION_STATE,
  payload: data,
  key
})
