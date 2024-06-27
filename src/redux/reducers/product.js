import { productAction } from "../actionTypes";

const initialState = {
  productListSuccess: false,
  productListLoader: false,
  productList: [],
};

export default function productModule(
  state = initialState,
  { payload, type, key }
) {
  switch (type) {
    case productAction.GET_PRODUCTS_INITIATE:
      return {
        ...state,
        productListLoader: true,
        productListSuccess: false,
      };

    case productAction.GET_PRODUCTS_SUCCESS:
      return {
        ...state,
        productListLoader: false,
        productList: payload,
        productListSuccess: true,
      };

    case productAction.GET_PRODUCTS_FAILURE:
      return {
        ...state,
        productListLoader: false,
      };

    case productAction.UPDATE_PRODUCT_STATE:
      state[key] = payload
      return { ...state, }

    default:
      return state;
  }
}
