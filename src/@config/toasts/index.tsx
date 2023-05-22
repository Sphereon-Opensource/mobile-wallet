import React from 'react';
import {ToastConfigParams} from 'react-native-toast-message';

import SSIToast from '../../components/messageBoxes/toasts/SSIToast';
import {IToastCustomProps, ToastTypeEnum} from '../../types';

export const toastsBottomOffset = 0;
export const toastsAutoHide = true;
export const toastsVisibilityTime = 6000;

export const toastConfig = {
  ssiAlertToastSuccess: (params: ToastConfigParams<IToastCustomProps>) => {
    const {text1, text2} = params;
    const {showBadge = true} = params.props;
    return <SSIToast type={ToastTypeEnum.TOAST_SUCCESS} title={text1} message={text2} showBadge={showBadge} />;
  },
  ssiAlertToastError: (params: ToastConfigParams<IToastCustomProps>) => {
    const {text1, text2} = params;
    const {showBadge = true} = params.props;
    return <SSIToast type={ToastTypeEnum.TOAST_ERROR} title={text1} message={text2} showBadge={showBadge} />;
  },
};
