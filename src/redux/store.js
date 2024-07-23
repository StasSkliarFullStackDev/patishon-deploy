import { applyMiddleware, createStore } from 'redux'
import { createLogger } from 'redux-logger'
import createSagaMiddleware from 'redux-saga'

import rootReducer from './rootReducer'
import rootSaga from './saga'


const logger = createLogger({
    duration: false,
    timestamp: false,
    // diff: true,
})

const sagaMiddleware = createSagaMiddleware()

const createStoreWithMiddleware = applyMiddleware(
    sagaMiddleware,
    logger
)(createStore)

const store = createStoreWithMiddleware(rootReducer)

sagaMiddleware.run(rootSaga)

export default store
