import { createSelector } from 'reselect'

export const getMemoizedProductsData = createSelector(
    (state) => state.products,
    (productsState) => {
        const {
            productListSuccess,
            productListLoader,
            productList
        } = productsState

        return {
            productListSuccess,
            productListLoader,
            productList
        }
    }
)