import Toast from 'react-native-toast-message';

import {ToastTypeEnum} from '../types';

export const showToast = (type: ToastTypeEnum, message: string) => {
  Toast.show({
    position: 'bottom',
    type,
    text1: message,
  });
};
