import { applyMiddleware, bindActionCreators, combineReducers, createStore } from 'redux'
import thunk from 'redux-thunk'

import connectionReducer from '../store/reducers/connection.reducer'
import userReducer from '../store/reducers/user.reducer'

import { getConnectionParties } from './actions/connection.actions'
import { getContacts } from './actions/contact.actions'
import { getVerifiableCredentials } from './actions/credential.actions'
import authenticationReducer from './reducers/authentication.reducer'
import contactReducer from './reducers/contact.reducer'
import credentialReducer from './reducers/credential.reducer'

const rootReducer = combineReducers({
  user: userReducer,
  connection: connectionReducer,
  authentication: authenticationReducer,
  credential: credentialReducer,
  contact: contactReducer
})

export type RootState = ReturnType<typeof rootReducer>
const store = createStore(rootReducer, applyMiddleware(thunk))

const actions = bindActionCreators({ getConnectionParties, getVerifiableCredentials, getContacts }, store.dispatch)
actions.getVerifiableCredentials()
actions.getConnectionParties()
actions.getContacts()

export default store
