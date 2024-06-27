import { put, call } from "redux-saga/effects";
import { toast } from "react-nextjs-toast";

import {
    getCartItemsSuccess,
    getCartItemsFailure,
    addToCartSuccess,
    addToCartFailure,
    deleteCartItemSuccess,
    deleteCartItemFailure
} from "../actions/cart";
import { getCart, addCartItem, deleteCartItem } from "../../Api/index"
import { Navigate } from "react-router";

export function* cartListSaga(action) {

    try {
        let response = yield call(getCart);
        console.log("response = ", response.result)
        let { result, status } = response;
        if (status === 1) {
            console.log("this is entered")
            yield put(getCartItemsSuccess(result.data.data));
        } else {
            yield put(getCartItemsFailure(result.message));
            toast.notify(result.message, {
                duration: 5,
                type: "error",
            });
        }
    } catch (error) {
        if (error?.status === 4) {
            // yield call(loginAgain, error.error, action.navigate);
            yield put(getCartItemsFailure(error.error));
            toast.notify(error.error, {
                duration: 5,
                type: "error",
            });
        } else {
            yield put(getCartItemsFailure(error.error));
            toast.notify(error.error, {
                duration: 5,
                type: "error",
            });
        }
    }
}

export function* addCartItemSaga(action) {

    try {
        let response = yield call(addCartItem, action.payload);
        console.log("response = ", response.result)
        let { result, status } = response;
        if (status === 1) {
            window.location = "/landing"
            yield call(cartListSaga)
            yield put(addToCartSuccess(result.data.data));
        } else {
            yield put(addToCartFailure(result.message));
            toast.notify(result.message, {
                duration: 5,
                type: "error",
            });
        }
    } catch (error) {
        if (error?.status === 4) {
            // yield call(loginAgain, error.error, action.navigate);
            yield put(addToCartFailure(error.error));
            toast.notify(error.error, {
                duration: 5,
                type: "error",
            });
        } else {
            yield put(addToCartFailure(error.error));
            toast.notify(error.error, {
                duration: 5,
                type: "error",
            });
        }
    }
}

export function* deleteCartItemSaga(action) {

    try {
        let response = yield call(deleteCartItem, action.payload);
        console.log("response = ", response.result)
        let { result, status } = response;
        if (status === 1) {
            console.log("this is entered")
            yield call(cartListSaga)
            yield put(deleteCartItemSuccess(result.data));
        } else {
            yield put(deleteCartItemFailure(result.message));
            toast.notify(result.message, {
                duration: 5,
                type: "error",
            });
        }
    } catch (error) {
        if (error?.status === 4) {
            // yield call(loginAgain, error.error, action.navigate);
            yield put(deleteCartItemFailure(error.error));
            toast.notify(error.error, {
                duration: 5,
                type: "error",
            });
        } else {
            yield put(deleteCartItemFailure(error.error));
            toast.notify(error.error, {
                duration: 5,
                type: "error",
            });
        }
    }
}