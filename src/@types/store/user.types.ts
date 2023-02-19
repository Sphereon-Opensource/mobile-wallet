import { IUser } from '../user'

export interface IUserState {
  loading: boolean
  user?: IUser
}
