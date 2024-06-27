import { createSelector } from 'reselect'

export const getMemoizedCartData = createSelector(
  (state) => state.cart,
  (cartState) => {
    const {
      cartItems,
      cartItemsCount,
      cartItemsLoader,
      cartItemsSuccess,
      addItemLoader,
      addItemSuccess,
      deleteItemSuccess,
      deleteItemLoader,
      placeOrder
    } = cartState

    return {
      cartItems,
      cartItemsCount,
      cartItemsLoader,
      cartItemsSuccess,
      addItemLoader,
      addItemSuccess,
      deleteItemSuccess,
      deleteItemLoader,
      placeOrder
    }
  }
)