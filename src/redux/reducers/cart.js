import { cartAction } from "../actionTypes"

const initialState = {
    cartItems: [],
    cartItemsCount: 0,
    cartItemsLoader: false,
    cartItemsSuccess: false,
    addItemLoader: false,
    addItemSuccess: false,
    deleteItemLoader: false,
    deleteItemSuccess: false,
    placeOrder: false
}

export default function cart(
    state = initialState, 
    { type, payload, key}
) {
    switch (type) {
 
        case cartAction.GET_CART_DATA_INITIATE:
            return {
                ...state,
                cartItemsLoader: true,
                cartItemsSuccess: false
            }

        case cartAction.GET_CART_DATA_SUCCESS:
            console.log("this is cart reducer = ", payload)
            return {
                ...state,
                cartItems: payload.list,
                cartItemsCount: payload.pagination.totalCount,
                cartItemsLoader: false,
                cartItemsSuccess: true
            }

        case cartAction.GET_CART_DATA_FAILURE:
            return {
                ...state,
                cartItemsLoader: false,
                cartItemsSuccess: false
            }

        case cartAction.ADD_TO_CART_INITIATE:
            return {
                ...state,
                addItemLoader: true,
                addItemSuccess: false
            }

        case cartAction.ADD_TO_CART_SUCCESS:
            return {
                ...state,
                addItemLoader: false,
                addItemSuccess: true
            }

        case cartAction.ADD_TO_CART_FAILURE:
            return {
                ...state,
                addItemLoader: false,
                addItemSuccess: false
            }

        case cartAction.DELETE_CART_ITEM_INITIATE:
            return {
                ...state,
                deleteItemLoader: true,
                deleteItemSuccess: false
            }

        case cartAction.DELETE_CART_ITEM_SUCCESS:
            return {
                ...state,
                deleteItemLoader: false,
                deleteItemSuccess: true
            }

        case cartAction.DELETE_CART_ITEM_FAILURE:
            return {
                ...state,
                deleteItemLoader: false,
                deleteItemSuccess: false
            }

        case cartAction.UPDATE_CART_STATE:
            state[key] = payload
            return {...state}
    
        default:
            return state;
    }
}