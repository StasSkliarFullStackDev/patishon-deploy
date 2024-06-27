import { put, call, select } from "redux-saga/effects";
import { toast } from "react-nextjs-toast";

import {
  getRoomSizeSuccess,
  getRoomSizeFailure,
  placeOrderSuccess,
  placeOrderFailure
} from "../actions/configuration";
import {
  getCartItemsInitiate
} from "../actions/cart"
import { roomSize, placeOrder } from "../../Api/index"

import { authenticationAction } from "../actionTypes";

export function* roomSizeSaga(action) {

  try {
    let response = yield call(roomSize);
    console.log("response = ", response)
    let { result, status } = response;
    if (status === 1) {
      const reducerBluePrint = yield select((state)=>state.blueprint3d.BP3DData)
      yield put(getRoomSizeSuccess({...result.data, ...reducerBluePrint}));
    } else {
      yield put(getRoomSizeFailure(result.message));
      toast.notify(result.message, {
        duration: 5,
        type: "error",
      });
    }
  } catch (error) {
    if (error?.status === 4) {
      // yield call(loginAgain, error.error, action.navigate);
      yield put(getRoomSizeFailure(error.error));
      toast.notify(error.error, {
        duration: 5,
        type: "error",
      });
    } else {
      yield put(getRoomSizeFailure(error.error));
      toast.notify(error.error, {
        duration: 5,
        type: "error",
      });
    }
  }
}

export function* placeOrderSaga(action) {

  try {
    let response = yield call(placeOrder, action.payload);
    let { result, status } = response;
    
    if (status === 1) {
      if (action?.payload?.fromCart) {
        console.log("response place = ", action.payload, "data = ", result.data)
        yield put(getCartItemsInitiate())
      }
      yield put(placeOrderSuccess(result.data.data));
    } else {
      yield put(placeOrderFailure(result.message));
      toast.notify(result.message, {
        duration: 5,
        type: "error",
      });
    }
  } catch (error) {
    if (error?.status === 4) {
      // yield call(loginAgain, error.error, action.navigate);
      yield put(placeOrderFailure(error.error));
      toast.notify(error.error, {
        duration: 5,
        type: "error",
      });
    } else {
      yield put(placeOrderFailure(error.error));
      toast.notify(error.error, {
        duration: 5,
        type: "error",
      });
    }
  }
}
