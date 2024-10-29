import {configureStore} from '@reduxjs/toolkit';
import {combineReducers} from 'redux';
import thunk from 'redux-thunk';
import contactReducer from './reducers/contact.reducer';
import credentialReducer from './reducers/credential.reducer';
import userReducer from './reducers/user.reducer';
import dpopReducer from './reducers/dpop.reducer';

export const rootReducer = combineReducers({
  user: userReducer,
  credential: credentialReducer,
  contact: contactReducer,
  dpop: dpopReducer,
});

const store = configureStore({
  reducer: rootReducer,
  middleware: [thunk],
  devTools: true,
});

export default store;
