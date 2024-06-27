import { put, call } from "redux-saga/effects";
import { toast } from "react-nextjs-toast";

import {
    getProductsSuccess,
    getProductsFailure
} from "../actions/product";
import { getProducts } from "../../Api/index"

import { authenticationAction } from "../actionTypes";

export function* productsListSaga(action) {

    try {
        let response = yield call(getProducts);
        console.log("response = ", response)
        let { result, status } = response;
        if (status === 1) {
            yield put(getProductsSuccess(result.data));
        } else {
            yield put(getProductsFailure(result.message));
            toast.notify(result.message, {
                duration: 5,
                type: "error",
            });
        }
    } catch (error) {
        if (error?.status === 4) {
            // yield call(loginAgain, error.error, action.navigate);
            yield put(getProductsFailure(error.error));
            toast.notify(error.error, {
                duration: 5,
                type: "error",
            });
        } else {
            yield put(getProductsFailure(error.error));
            toast.notify(error.error, {
                duration: 5,
                type: "error",
            });
        }
    }
}