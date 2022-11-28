import { Dispatch } from 'react'
import { AnyAction } from 'redux'

import { SET_USER } from '../../@types/store/user.action.types'
import { IUser } from '../../@types/store/user.types'

export const setUser = (payload: IUser) => {
  return (dispatch: Dispatch<AnyAction>) => {
    dispatch({ type: SET_USER, payload })
  }
}
