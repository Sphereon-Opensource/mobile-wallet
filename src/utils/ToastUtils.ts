import Toast from 'react-native-toast-message'

export const showToast = (type: ToastTypeEnum, text1: string) => {
  Toast.show({
    position: 'bottom',
    type,
    text1
  })
}

export enum ToastTypeEnum {
  TOAST_SUCCESS = 'ssiAlertToastSuccess',
  TOAST_ERROR = 'ssiAlertToastError'
}
