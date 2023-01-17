import React from 'react'
import { ToastConfigParams } from 'react-native-toast-message'

import {
  SSIAlertToastContainerStyled as AlertToastContainer,
  SSIAlertToastIconContainerStyled as AlertToastIconContainer,
  SSIAlertToastMessageTextStyled as AlertToastMessageCaption,
  SSIToastErrorIconStyled as ErrorIcon
} from '../../styles/styledComponents'

export const toastsBottomOffset = 0
export const toastsAutoHide = true
export const toastsVisibilityTime = 4000

export const toastConfig = {
  ssiAlertToastSuccess: (params: ToastConfigParams<unknown>) => (
    <AlertToastContainer>
      <AlertToastMessageCaption>{params.text1}</AlertToastMessageCaption>
    </AlertToastContainer>
  ),
  ssiAlertToastError: (params: ToastConfigParams<unknown>) => (
    <AlertToastContainer>
      <AlertToastIconContainer>
        <ErrorIcon />
      </AlertToastIconContainer>
      <AlertToastMessageCaption>{params.text1}</AlertToastMessageCaption>
    </AlertToastContainer>
  )
}
