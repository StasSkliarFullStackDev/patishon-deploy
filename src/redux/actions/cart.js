import { cartAction } from "../actionTypes"

export const getCartItemsInitiate = () => ({
  type: cartAction.GET_CART_DATA_INITIATE
})

export const getCartItemsSuccess = (data) => ({
  type: cartAction.GET_CART_DATA_SUCCESS,
  payload: data
})

export const getCartItemsFailure = (error) => ({
  type: cartAction.GET_CART_DATA_FAILURE,
  payload: error
})

export const addToCartInitiate = (data) => ({
  type: cartAction.ADD_TO_CART_INITIATE,
  payload: data
})

export const addToCartSuccess = (data) => ({
  type: cartAction.ADD_TO_CART_SUCCESS,
  payload: data
})

export const addToCartFailure = (error) => ({
  type: cartAction.ADD_TO_CART_FAILURE,
  payload: error
})

export const deleteCartItemInitiate = (data) => ({
  type: cartAction.DELETE_CART_ITEM_INITIATE,
  payload: data
})

export const deleteCartItemSuccess = (data) => ({
  type: cartAction.DELETE_CART_ITEM_SUCCESS,
  payload: data
})

export const deleteCartItemFailure = (error) => ({
  type: cartAction.DELETE_CART_ITEM_FAILURE,
  payload: error
})

export const updateCartStates = (data, key) => ({
  type: cartAction.UPDATE_CART_STATE,
  payload: data,
  key
})

export const clearCartItems = () => ({
  type: cartAction.CLEAR_CART_DATA
})