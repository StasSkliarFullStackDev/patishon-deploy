
import { combineReducers } from 'redux'

import blueprint3d from './reducers/blueprint3d'
import products from './reducers/product'
import configuration from './reducers/configuration'
import cart from './reducers/cart'

const rootReducer = combineReducers({
    blueprint3d,
    products,
    configuration,
    cart
})

export default rootReducer