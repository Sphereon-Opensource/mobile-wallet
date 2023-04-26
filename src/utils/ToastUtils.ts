import Toast from 'react-native-toast-message';

import {IToastConfigParams, ToastTypeEnum} from '../types';

export const showToast = (type: ToastTypeEnum, params: IToastConfigParams) => {
  const {message, title, showBadge} = params;
  Toast.show({
    position: 'bottom',
    type,
    text1: title,
    text2: message,
    props: {
      showBadge,
    },
  });
};
