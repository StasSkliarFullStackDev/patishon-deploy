import { takeEvery, takeLatest } from "redux-saga/effects";

import {
  engineAction,
  productAction,
  configurationAction,
  cartAction
} from "../actionTypes";

import {
  productsListSaga
} from "./product";

import {
  placeOrderSaga,
  roomSizeSaga
} from "./configuration";

import {
  cartListSaga,
  addCartItemSaga,
  deleteCartItemSaga
} from "./cart"


export default function* watcherSaga() {
  // product
  yield takeLatest(productAction.GET_PRODUCTS_INITIATE, productsListSaga)
  //blueprint
  yield takeLatest(configurationAction.GET_ROOM_SIZE_INITIATE, roomSizeSaga)
  yield takeLatest(configurationAction.PLACE_ORDER_INITIATE, placeOrderSaga)
  // Cart
  yield takeLatest(cartAction.GET_CART_DATA_INITIATE, cartListSaga)
  yield takeLatest(cartAction.ADD_TO_CART_INITIATE, addCartItemSaga)
  yield takeLatest(cartAction.DELETE_CART_ITEM_INITIATE, deleteCartItemSaga)
}