import { applyMiddleware, bindActionCreators, combineReducers, createStore } from 'redux'
import thunk from 'redux-thunk'

import connectionReducer from '../store/reducers/connection.reducer'
import userReducer from '../store/reducers/user.reducer'

import { dispatchConnectionParties } from './actions/connection.actions'
import { getVerifiableCredentials } from './actions/credential.actions'
import authenticationReducer from './reducers/authentication.reducer'
import credentialReducer from './reducers/credential.reducer'

const rootReducer = combineReducers({
  user: userReducer,
  connection: connectionReducer,
  authentication: authenticationReducer,
  credential: credentialReducer
})

export type RootState = ReturnType<typeof rootReducer>
const store = createStore(rootReducer, applyMiddleware(thunk))

const actions = bindActionCreators({ dispatchConnectionParties, getVerifiableCredentials }, store.dispatch)
actions.getVerifiableCredentials()
actions.dispatchConnectionParties()

export default store
