import { productAction } from '../actionTypes'

export const getProductsInitiate = (data, history) => ({
  type: productAction.GET_PRODUCTS_INITIATE,
  payload: data,
  history,
});

export const getProductsSuccess = (data) => ({
  type: productAction.GET_PRODUCTS_SUCCESS,
  payload: data,
});

export const getProductsFailure = (error) => ({
  type: productAction.GET_PRODUCTS_FAILURE,
  payload: error,
})

export const updateProductStates = (data, key) => ({
  type: productAction.UPDATE_PRODUCT_STATE,
  payload: data,
  key
})
