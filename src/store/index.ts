import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { AnyAction, applyMiddleware, bindActionCreators, combineReducers, createStore, Store } from 'redux'
import thunk, { ThunkDispatch } from 'redux-thunk'

import connectionReducer from '../store/reducers/connection.reducer'
import userReducer from '../store/reducers/user.reducer'

import { getConnectionParties } from './actions/connection.actions'
import { getContacts } from './actions/contact.actions'
import { getVerifiableCredentials } from './actions/credential.actions'
import authenticationReducer from './reducers/authentication.reducer'
import contactReducer from './reducers/contact.reducer'
import credentialReducer from './reducers/credential.reducer'
import onboardingReducer from './reducers/onboarding.reducer'

const rootReducer = combineReducers({
  user: userReducer,
  connection: connectionReducer,
  authentication: authenticationReducer,
  credential: credentialReducer,
  contact: contactReducer,
  onboarding: onboardingReducer
})

// https://stackoverflow.com/questions/70143816/argument-of-type-asyncthunkactionany-void-is-not-assignable-to-paramete
export type RootState = ReturnType<typeof rootReducer>
export type AppThunkDispatch = ThunkDispatch<RootState, any, AnyAction>
export type AppStore = Omit<Store<RootState>, 'dispatch'> & {
  dispatch: AppThunkDispatch
}
export const useAppDispatch = () => useDispatch<AppThunkDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

const store: AppStore = createStore(rootReducer, applyMiddleware(thunk))

const actions = bindActionCreators(
  {
    getConnectionParties,
    getVerifiableCredentials,
    getContacts
  },
  store.dispatch
)
actions.getVerifiableCredentials()
actions.getConnectionParties()
actions.getContacts()

export default store
