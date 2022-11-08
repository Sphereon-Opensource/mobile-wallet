import { IUser } from './user.types'

export const SET_USER = '[USER] SET_USER'
export type SET_USER = typeof SET_USER

interface ISetUserAction {
  type: SET_USER
  payload: IUser
}

export type UserActionTypes = ISetUserAction
