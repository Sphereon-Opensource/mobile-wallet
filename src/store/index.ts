import { configureStore } from '@reduxjs/toolkit'
import { combineReducers } from 'redux'
import thunk from 'redux-thunk'

import authenticationReducer from './reducers/authentication.reducer'
import connectionReducer from './reducers/connection.reducer'
import contactReducer from './reducers/contact.reducer'
import credentialReducer from './reducers/credential.reducer'
import onboardingReducer from './reducers/onboarding.reducer'
import userReducer from './reducers/user.reducer'

export const rootReducer = combineReducers({
  user: userReducer,
  connection: connectionReducer,
  authentication: authenticationReducer,
  credential: credentialReducer,
  contact: contactReducer,
  onboarding: onboardingReducer
})

const store = configureStore({
  reducer: rootReducer,
  middleware: [thunk],
  devTools: true
})

export default store
