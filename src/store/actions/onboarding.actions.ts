import { Dispatch } from 'react'
import { AnyAction } from 'redux'

import { SET_PERSONAL_DATA } from '../../@types/store/onboarding.action.types'
import { ISetPersonalDataActionArgs } from '../../@types/store/onboarding.types'

export const setPersonalData = (payload: ISetPersonalDataActionArgs): ((dispatch: Dispatch<AnyAction>) => void) => {
  return (dispatch: Dispatch<AnyAction>) => {
    dispatch({ type: SET_PERSONAL_DATA, payload })
  }
}
